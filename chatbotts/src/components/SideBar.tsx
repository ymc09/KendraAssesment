import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getUserChats } from "../api/chat";
import { Drawer } from "antd";
import type { ChatType } from "../types"; // Make sure to import your Chat type
import { useChatMutations } from "../hooks/chatHooks";
import { useNavigate } from "react-router-dom";
import ChatItem from "./ChatItem";


export default function SideBar() {
    const { data: chats, isLoading, error,refetch } = useQuery<ChatType[], Error>({
        queryKey: ['chats'],
        queryFn: async () =>{ return await getUserChats()},
    });
      const navigate = useNavigate();

    const [shown, setShown] = useState(false);

    const handleSideBar = () => {
        setShown((prev) => !prev);
    };

    const {createChat}=useChatMutations();

    const handleCreateChat=async()=>{
try{
       const chat_id= await createChat()
        if (chat_id)
        {
            navigate(`/chat/${chat_id}`)
            await refetch();

        }

    }
    catch(e)
    {
        console.error(e)
    }
    }

    return (
        <div className="flex h-screen p-4 flex-col items-center w-32 gap-4 bg-gray-700 text-white">
            <button 
                onClick={handleSideBar} 
                className="p-4 bg-green-300 rounded-lg hover:cursor-crosshair hover:opacity-85 transition-opacity duration-150 ease-in-out"
            >
                Open Chats
            </button>

            <button onClick={handleCreateChat} className="p-3 w-fit hover:cursor-pointer rounded-lg h-fit bg-green-300">
                +
            </button>
            
            <Drawer 
                title="Chats"

                placement={'left'}
                width={500}
                onClose={() => setShown(false)}
                open={shown}
                style={{'backgroundColor':'#364153', 'color':'white ' }}
            >    
                <div className="flex  flex-col gap-2">
                    {isLoading &&<div className="flex flex-col justify-center align-center">Loading</div>}
                    {chats?.map((c) => {
              
                        return <ChatItem closeDrawer={handleSideBar} id={c.chat_id} title={c.chat_name}/>}
                    )}

  </div>
 {error && <div>Error loading chats: {error.message}</div>}
              
            </Drawer>
        </div>
    )
}