import { api } from '@/services/api';
import { normalizeServiceError, requireApiData } from '@/services/service-error';
import type { ApiEnvelope } from '@/types/api';
import type {
  PipocaiConversationPayload,
  PipocaiMemoryEntry,
  SavePipocaiMemoryRequest,
  SendPipocaiMessageRequest,
} from '@/types/pipocai';

const PIPOCAI_ROUTES = {
  conversation: '/pipocai/conversation',
  memories: '/pipocai/memories',
  memory: '/pipocai/memories/{id}',
  sendMessage: '/pipocai/conversation/messages',
} as const;

export const pipocaiService = {
  routes: PIPOCAI_ROUTES,

  async getConversation(): Promise<PipocaiConversationPayload> {
    try {
      const response = await api.get<ApiEnvelope<PipocaiConversationPayload>>(
        PIPOCAI_ROUTES.conversation,
      );
      return requireApiData(
        response.data,
        'Resposta inválida ao carregar conversa do Pipocai. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível carregar a conversa com o Pipocai.');
    }
  },

  async sendMessage(request: SendPipocaiMessageRequest): Promise<PipocaiConversationPayload> {
    try {
      const response = await api.post<ApiEnvelope<PipocaiConversationPayload>>(
        PIPOCAI_ROUTES.sendMessage,
        request,
      );
      return requireApiData(
        response.data,
        'Resposta inválida ao enviar mensagem para o Pipocai. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível enviar sua mensagem para o Pipocai.');
    }
  },

  async getMemories(): Promise<PipocaiMemoryEntry[]> {
    try {
      const response = await api.get<ApiEnvelope<PipocaiMemoryEntry[]>>(PIPOCAI_ROUTES.memories);
      return requireApiData(
        response.data,
        'Resposta inválida ao carregar memória do Pipocai. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível carregar a memória do Pipocai.');
    }
  },

  async addMemory(request: SavePipocaiMemoryRequest): Promise<PipocaiMemoryEntry[]> {
    try {
      const response = await api.post<ApiEnvelope<PipocaiMemoryEntry[]>>(
        PIPOCAI_ROUTES.memories,
        request,
      );
      return requireApiData(
        response.data,
        'Resposta inválida ao adicionar memória do Pipocai. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível adicionar esta memória.');
    }
  },

  async updateMemory(
    memoryId: string,
    request: SavePipocaiMemoryRequest,
  ): Promise<PipocaiMemoryEntry[]> {
    try {
      const response = await api.patch<ApiEnvelope<PipocaiMemoryEntry[]>>(
        PIPOCAI_ROUTES.memory.replace('{id}', memoryId),
        request,
      );
      return requireApiData(
        response.data,
        'Resposta inválida ao atualizar memória do Pipocai. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível atualizar esta memória.');
    }
  },

  async deleteMemory(memoryId: string): Promise<PipocaiMemoryEntry[]> {
    try {
      const response = await api.delete<ApiEnvelope<PipocaiMemoryEntry[]>>(
        PIPOCAI_ROUTES.memory.replace('{id}', memoryId),
      );
      return requireApiData(
        response.data,
        'Resposta inválida ao remover memória do Pipocai. Tente novamente em instantes.',
      );
    } catch (error: unknown) {
      throw normalizeServiceError(error, 'Não foi possível remover esta memória.');
    }
  },
};
