import { ApiError, type ChatType, type ValidationErrorResponse } from "../types";
const API_BASE_URL ='https://chatai.valigate.io/api'
const TENANT_NAME='valigate'
const USER_ID='auth0|67efd0df0f83c40778e7dde2'
const STREAM_USER_ID='a51047e3-452e-49ee-a226-1659eaa50c3c'


export const  getUserChats=async(): Promise<ChatType[]>=>{

try{
  const pageNumber=1;
  const pageSize=20;
    const params=new URLSearchParams({
        user_id:USER_ID??"",
        tenant_name:TENANT_NAME??"",
        page_number:pageNumber.toString(),
        page_size: pageSize.toString()
    })

    const res= await fetch(`${API_BASE_URL}/chat/user_chats?${params}`)

    if (!res.ok)
    {
         const err = await res.json()
    if (res.status===422)
    {
        throw new ApiError(
          res.status,
          'Validation failed',
          (err as ValidationErrorResponse).detail
        );
    }

     throw new ApiError(
        res.status,
        err?.msg || `HTTP error! status: ${res.status}`
      );
}
    return res.json()
}
catch(e){

console.error("Unable to Get User Chats: ",e)

    if (e instanceof ApiError) {
      throw e;
    }

    throw new ApiError(500, 'Server Error Occured');
}
}


export const  getChatMessages=async(pageNumber: number = 1,pageSize: number = 20,chat_id:string):Promise<Message[]>=>{

try{
    const params=new URLSearchParams({
        user_id:USER_ID??"",
        tenant_name:TENANT_NAME??"",
        chat_id:chat_id,
        page_number:pageNumber.toString(),
        page_size: pageSize.toString()
    })

    const res= await fetch(`${API_BASE_URL}/chat/messages?${params}`)

    if (!res.ok)
    {
         const err = await res.json()
    if (res.status===422)
    {
        throw new ApiError(
          res.status,
          'Validation failed',
          (err as ValidationErrorResponse).detail
        );
    }

     throw new ApiError(
        res.status,
        err?.msg || `HTTP error! status: ${res.status}`
      );
}
    return await res.json()
}
catch(e){

console.error("Unable to Get User Chats: ",e)

    if (e instanceof ApiError) {
      throw e;
    }

    throw new ApiError(500, 'Server Error Occured');
}
}
export const createUserChat = async (): Promise<ChatType | ApiError> => {
  try {
    const params = new URLSearchParams({
      user_id: USER_ID ?? "",
      tenant_name: TENANT_NAME ?? "", 
    });

    const res = await fetch(`${API_BASE_URL}/chat?${params}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), 
    });

    if (!res.ok) {
      const err = await res.json();
      throw new ApiError(res.status, err?.msg || `Failed to create chat: ${res.status}`);
    }

    return await res.json();
  } catch (e) {
    console.error("Failed to Create Chat: ", e);
    if (e instanceof ApiError) throw e;
    throw new ApiError(500, 'Server Error Occurred');
  }
};

export const  renameChat=async(chat_id:string,new_name:string): Promise<ChatType|ApiError>=>{

try{

   const params=new URLSearchParams({
        user_id:USER_ID??"",
        tenant_name:TENANT_NAME??"",
        chat_id:chat_id
       
    })
   

    const res= await fetch(`${API_BASE_URL}/chat/rename?${params}`,{
        method:"PUT",
        body:JSON.stringify({
        new_name: new_name
      })
    })

    if (!res.ok)
    {
         const err = await res.json()
   

     throw new ApiError(
        res.status,
        err?.msg || `Failed to rename chat: ${res.status}`
      );


}
    return await res.json()
}
catch(e){

console.error("Failed to Rename Chat: ",e)

    if (e instanceof ApiError) {
      throw e;
    }

    throw new ApiError(500, 'Server Error Occured');
}
}


export const  deleteChat=async(chat_id:string): Promise<string>=>{

try{

  const params=new URLSearchParams({
        user_id:USER_ID??"",
        tenant_name:TENANT_NAME??"",
       chat_id:chat_id
    })

    const res= await fetch(`${API_BASE_URL}/chat?${params}`,{
        method:"DELETE",
    })

    if (!res.ok)
    {
         const err = await res.json()
   

     throw new ApiError(
        res.status,
        err?.msg || `Failed to create chat: ${res.status}`
      );


}
    return await res.json()
}
catch(e){

console.error("Failed to Create Chat: ",e)

    if (e instanceof ApiError) {
      throw e;
    }

    throw new ApiError(500, 'Server Error Occured');
}
}


export const streamChat = (
  userMessage: string,
  chatId: string,
  onMessage: (chunk: string) => void,
  onError?: (error: Error) => void
): (() => void) => {
  try {
    const params = new URLSearchParams({
      user_message: userMessage,
      chat_id: chatId,
      tenant_name: TENANT_NAME,
      user_id: STREAM_USER_ID,
      platform: 'generic'
    });

    const eventSource = new EventSource(`${API_BASE_URL}/chat/stream?${params}`);

   eventSource.onmessage = (event) => {
  if (event.data === '[DONE]') {
    eventSource.close();
    onMessage('[DONE]'); 
  } else {
    onMessage(event.data);
  }
};

    eventSource.onerror = () => {
      eventSource.close();
      onError?.(new Error('Error receiving stream'));
    };


    return () => {
      eventSource.close();
    };
  } catch (err) {
    onError?.(err instanceof Error ? err : new Error('Streaming failed'));
    
    return () => {};
  }
};