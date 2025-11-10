import { Event, EventCallback, EventName } from "@tauri-apps/api/event";

const handlers = {} as Record<EventName, EventCallback<unknown>>;

// Mock implementation of getCurrentWindow for Storybook environment.
export const getCurrentWindow = () => {
  return {
    close: async () => {},
    emit: async (eventName: EventName, event: Event<unknown>) => {
      const handler = handlers[eventName];
      // console.log("Emitting event:", eventName, handler);
      if (handler) {
        handler(event);
      }
    },
    isFocused: async () => true,
    isMaximized: async () => false,
    listen: async (event: EventName, handler: EventCallback<unknown>) => {
      // console.log("Listening to event:", event, handler);
      handlers[event] = handler;
      return Promise.resolve(() => {});
    },
    minimize: async () => {},
    toggleMaximize: async () => {},
  };
};
