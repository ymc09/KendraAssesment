import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserChat, deleteChat, renameChat } from "../api/chat";
import { ApiError } from "../types";
import type { ChatType } from "../types"; 
import { streamChat } from "../api/chat";

export const useChatMutations = () => {
  const queryClient = useQueryClient();

  const createChatMutation = useMutation<ChatType, ApiError>({
    mutationFn: async () => {
      const response = await createUserChat();
      if (response instanceof ApiError) throw response;
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey:['chats']})
    },
    onError: (error) => {
      console.error('Create chat error:', error.message);
    },
  });

  const renameChatMutation = useMutation<ChatType, ApiError, { chatId: string; newName: string }>({
    mutationFn: async ({ chatId, newName }) => {
      const response = await renameChat(chatId, newName);
      if (response instanceof ApiError) throw response;
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey:['chats']})
    },
    onError: (error) => {
      console.error('Rename chat error:', error.message);
    },
  });

  const deleteChatMutation = useMutation<void, ApiError, string>({
    mutationFn: async (chatId) => {
       await deleteChat(chatId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey:['chats']})
  },
    onError: (error) => {
      console.error('Delete chat error:', error.message);
    },
  });

    return {
    createChat: createChatMutation.mutateAsync,
    isCreating: createChatMutation.isPending,
    renameChat: renameChatMutation.mutateAsync,
    isRenaming: renameChatMutation.isPending,
    deleteChat: deleteChatMutation.mutateAsync,
    isDeleting: deleteChatMutation.isPending,
  };
}



export const useStreamChat = () => {
  const streamChatMutation = useMutation<
    void,
    ApiError,
    { message: string; chatId: string; onMessage: (chunk: string) => void }
  >({
    mutationFn: async ({ message, chatId, onMessage }) => {
      await new Promise<void>((resolve, reject) => {
       const cleanup = streamChat(
  message,
  chatId,
  (chunk) => {
     if (chunk === '[DONE]') {
      resolve(); 
    }
    else{
    onMessage(chunk);
    }
  },
  (error) => {
    cleanup?.();
    reject(error);
  }
);
      });
    },
    onError: (error) => {
      console.error('Stream error:', error.message);
    }
  });

  return {
    streamChat: streamChatMutation.mutateAsync,
    isStreaming: streamChatMutation.isPending 
  };
};