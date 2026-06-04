import { RunnableConfig } from '@langchain/core/runnables';
import { CustomerSupportState } from '../state/index';

/**
 * Process tool results and update state
 *
 * Parses tool output and updates the appropriate state fields
 * (intent, currentCustomer, reply, escalation).
 */
export async function processToolResults(
  state: CustomerSupportState,
  _config: RunnableConfig,
) {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1];

  if (lastMessage._getType() === 'tool') {
    const toolMessage = lastMessage as any;
    const toolName = toolMessage.name;
    const toolContent = toolMessage.content;

    console.log(`Processing result from: ${toolName}`);

    try {
      // Update state based on which tool was called
      if (toolName === 'classifyIntent') {
        const intent = JSON.parse(toolContent);
        console.log(`Intent: ${intent.category} (${intent.urgency})`);
        return {
          ...state,
          intent,
        };
      }

      if (toolName === 'lookupCustomer') {
        const lookupResult = JSON.parse(toolContent);
        if (lookupResult.found) {
          console.log(`Customer found: ${lookupResult.customerId}`);
          return {
            ...state,
            currentCustomer: {
              id: lookupResult.customerId,
              found: true,
              data: lookupResult.data,
            },
          };
        }
      }

      if (toolName === 'generateReply') {
        const reply = JSON.parse(toolContent);
        console.log('Reply generated');
        return {
          ...state,
          reply,
        };
      }

      if (toolName === 'checkEscalation') {
        const escalation = JSON.parse(toolContent);
        if (escalation.required) {
          console.log(`Escalation: ${escalation.ticketId}`);
        }
        return {
          ...state,
          escalation,
        };
      }
    } catch (error) {
      console.error(`Error processing ${toolName}:`, error);
    }
  }

  return { ...state };
}
