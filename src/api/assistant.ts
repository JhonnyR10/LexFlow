import type { AssistantAskInput, AssistantAskResponse } from '../../shared/ipc'

export const assistantApi = {
  ask: (input: AssistantAskInput): Promise<AssistantAskResponse> =>
    window.api.assistant.ask(input),
}
