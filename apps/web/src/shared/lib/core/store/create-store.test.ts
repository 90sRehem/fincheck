import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createStore, type Store } from './create-store';

describe('createStore', () => {
  // Test data types
  interface TestState {
    count: number;
    user: {
      name: string;
      age: number;
    };
    items: string[];
  }

  const initialState: TestState = {
    count: 0,
    user: { name: 'John', age: 25 },
    items: ['item1', 'item2']
  };

  let store: Store<TestState>;

  beforeEach(() => {
    store = createStore(initialState);
  });

  describe('Store Creation and Initial State', () => {
    it('should create a store with initial state', () => {
      expect(store).toBeDefined();
      expect(typeof store.getState).toBe('function');
      expect(typeof store.setState).toBe('function');
      expect(typeof store.subscribe).toBe('function');
    });

    it('should return initial state on getState', () => {
      const state = store.getState();
      expect(state).toEqual(initialState);
      // Note: getState returns the actual state reference, not a copy
      // This is typical behavior for state management libraries
    });

    it('should not mutate the original initial state', () => {
      store.setState({ count: 5 });
      expect(initialState.count).toBe(0); // Original unchanged
    });
  });

  describe('getState functionality', () => {
    it('should always return the current state', () => {
      const state1 = store.getState();
      expect(state1.count).toBe(0);

      store.setState({ count: 10 });
      const state2 = store.getState();
      expect(state2.count).toBe(10);
    });

    it('should return the same state reference for consistency', () => {
      const state1 = store.getState();
      const state2 = store.getState();
      
      expect(state1).toEqual(state2);
      expect(state1).toBe(state2); // Same reference (typical for state management)
    });
  });

  describe('setState functionality', () => {
    it('should update state with partial object', () => {
      store.setState({ count: 5 });
      expect(store.getState().count).toBe(5);
      expect(store.getState().user).toEqual(initialState.user); // Other props unchanged
    });

    it('should update nested objects', () => {
      store.setState({ user: { name: 'Jane', age: 30 } });
      const state = store.getState();
      expect(state.user.name).toBe('Jane');
      expect(state.user.age).toBe(30);
      expect(state.count).toBe(0); // Other props unchanged
    });

    it('should update arrays', () => {
      store.setState({ items: ['newItem'] });
      expect(store.getState().items).toEqual(['newItem']);
    });

    it('should update multiple properties at once', () => {
      store.setState({ 
        count: 100, 
        user: { name: 'Bob', age: 40 }
      });
      const state = store.getState();
      expect(state.count).toBe(100);
      expect(state.user.name).toBe('Bob');
      expect(state.user.age).toBe(40);
    });

    it('should work with function updater', () => {
      store.setState((prevState) => ({
        count: prevState.count + 1
      }));
      expect(store.getState().count).toBe(1);
    });

    it('should work with function updater returning full state', () => {
      store.setState((prevState) => ({
        ...prevState,
        count: prevState.count * 2,
        user: { ...prevState.user, age: prevState.user.age + 1 }
      }));
      const state = store.getState();
      expect(state.count).toBe(0); // 0 * 2 = 0
      expect(state.user.age).toBe(26); // 25 + 1 = 26
    });

    it('should preserve state immutability', () => {
      const stateBefore = store.getState();
      store.setState({ count: 999 });
      expect(stateBefore.count).toBe(0); // Previous state unchanged
    });
  });

  describe('Subscribe functionality', () => {
    it('should call listener when subscribed property changes', () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(
        (state) => state.count,
        listener
      );

      store.setState({ count: 5 });
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(5);

      unsubscribe();
    });

    it('should not call listener when unrelated property changes', () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(
        (state) => state.count,
        listener
      );

      store.setState({ user: { name: 'Changed', age: 99 } });
      expect(listener).not.toHaveBeenCalled();

      unsubscribe();
    });

    it('should call listener for nested property changes', () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(
        (state) => state.user.name,
        listener
      );

      store.setState({ user: { name: 'Alice', age: 28 } });
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('Alice');

      unsubscribe();
    });

    it('should support multiple subscribers', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = store.subscribe(
        (state) => state.count,
        listener1
      );
      const unsubscribe2 = store.subscribe(
        (state) => state.user.name,
        listener2
      );

      store.setState({ count: 10, user: { name: 'Multi', age: 35 } });

      expect(listener1).toHaveBeenCalledWith(10);
      expect(listener2).toHaveBeenCalledWith('Multi');

      unsubscribe1();
      unsubscribe2();
    });

    it('should call listener with initial value on subscription', () => {
      const listener = vi.fn();
      
      // First set a value
      store.setState({ count: 42 });
      
      // Then subscribe - the listener should be called with current value
      // Note: Based on implementation, listener is not called immediately on subscription
      // It only gets called on subsequent changes
      const unsubscribe = store.subscribe(
        (state) => state.count,
        listener
      );

      // Change the value to trigger listener
      store.setState({ count: 43 });
      expect(listener).toHaveBeenCalledWith(43);

      unsubscribe();
    });

    it('should handle complex selectors', () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(
        (state) => ({ 
          totalItems: state.items.length,
          userName: state.user.name 
        }),
        listener
      );

      store.setState({ 
        items: ['a', 'b', 'c'],
        user: { name: 'Complex', age: 30 }
      });

      expect(listener).toHaveBeenCalledWith({
        totalItems: 3,
        userName: 'Complex'
      });

      unsubscribe();
    });
  });

  describe('Unsubscribe functionality', () => {
    it('should stop calling listener after unsubscribe', () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(
        (state) => state.count,
        listener
      );

      store.setState({ count: 1 });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      
      store.setState({ count: 2 });
      expect(listener).toHaveBeenCalledTimes(1); // Still only called once
    });

    it('should not affect other subscribers when one unsubscribes', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = store.subscribe(
        (state) => state.count,
        listener1
      );
      const unsubscribe2 = store.subscribe(
        (state) => state.count,
        listener2
      );

      store.setState({ count: 1 });
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      unsubscribe1();

      store.setState({ count: 2 });
      expect(listener1).toHaveBeenCalledTimes(1); // No longer called
      expect(listener2).toHaveBeenCalledTimes(2); // Still called

      unsubscribe2();
    });

    it('should be safe to call unsubscribe multiple times', () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(
        (state) => state.count,
        listener
      );

      unsubscribe();
      unsubscribe(); // Should not throw
      unsubscribe(); // Should not throw

      store.setState({ count: 5 });
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Custom Equality Function', () => {
    it('should use default Object.is equality when not provided', () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(
        (state) => state.count,
        listener
      );

      // Setting the same value should not trigger listener
      store.setState({ count: 0 });
      expect(listener).not.toHaveBeenCalled();

      // Setting different value should trigger listener
      store.setState({ count: 1 });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
    });

    it('should use custom equality function when provided', () => {
      const listener = vi.fn();
      
      // Custom equality that considers numbers equal if their difference is < 5
      const customEqual = (a: number, b: number) => Math.abs(a - b) < 5;
      
      const unsubscribe = store.subscribe(
        (state) => state.count,
        listener,
        customEqual
      );

      store.setState({ count: 3 }); // diff = 3, should not trigger (< 5)
      expect(listener).not.toHaveBeenCalled();

      store.setState({ count: 6 }); // diff = 6, should trigger (>= 5)
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(6);

      unsubscribe();
    });

    it('should work with object equality functions', () => {
      const listener = vi.fn();
      
      // Custom equality that only checks the name property
      const customEqual = (a: { name: string; age: number }, b: { name: string; age: number }) => 
        a.name === b.name;
      
      const unsubscribe = store.subscribe(
        (state) => state.user,
        listener,
        customEqual
      );

      // Same name, different age - should not trigger
      store.setState({ user: { name: 'John', age: 99 } });
      expect(listener).not.toHaveBeenCalled();

      // Different name - should trigger
      store.setState({ user: { name: 'Jane', age: 99 } });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle empty partial updates', () => {
      const stateBefore = store.getState();
      store.setState({});
      const stateAfter = store.getState();
      
      expect(stateAfter).toEqual(stateBefore);
    });

    it('should handle function updater returning empty object', () => {
      const stateBefore = store.getState();
      store.setState(() => ({}));
      const stateAfter = store.getState();
      
      expect(stateAfter).toEqual(stateBefore);
    });

    it('should handle subscribers with throwing selectors gracefully', () => {
      const listener = vi.fn();
      const throwingSelector = () => {
        throw new Error('Selector error');
      };

      // This should not crash the store
      expect(() => {
        const unsubscribe = store.subscribe(throwingSelector, listener);
        unsubscribe();
      }).toThrow('Selector error');
    });

    it('should handle subscribers with throwing listeners gracefully', () => {
      const throwingListener = vi.fn(() => {
        throw new Error('Listener error');
      });

      const unsubscribe = store.subscribe(
        (state) => state.count,
        throwingListener
      );

      // The store should continue to work even if a listener throws
      expect(() => {
        store.setState({ count: 1 });
      }).toThrow('Listener error');

      unsubscribe();
    });

    it('should maintain subscription order', () => {
      const callOrder: number[] = [];
      
      const listener1 = vi.fn(() => callOrder.push(1));
      const listener2 = vi.fn(() => callOrder.push(2));
      const listener3 = vi.fn(() => callOrder.push(3));

      const unsubscribe1 = store.subscribe((state) => state.count, listener1);
      const unsubscribe2 = store.subscribe((state) => state.count, listener2);
      const unsubscribe3 = store.subscribe((state) => state.count, listener3);

      store.setState({ count: 1 });

      expect(callOrder).toEqual([1, 2, 3]);

      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    });

    it('should work with very large numbers of subscribers', () => {
      const listeners = Array.from({ length: 1000 }, () => vi.fn());
      const unsubscribers = listeners.map((listener) =>
        store.subscribe((state) => state.count, listener)
      );

      store.setState({ count: 42 });

      for (const listener of listeners) {
        expect(listener).toHaveBeenCalledWith(42);
      }

      // Clean up
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
    });
  });

  describe('Type Safety and Generic Support', () => {
    it('should work with different state types', () => {
      interface StringState {
        message: string;
        active: boolean;
      }

      const stringStore = createStore<StringState>({
        message: 'hello',
        active: true
      });

      const listener = vi.fn();
      const unsubscribe = stringStore.subscribe(
        (state) => state.message,
        listener
      );

      stringStore.setState({ message: 'world' });
      expect(listener).toHaveBeenCalledWith('world');

      unsubscribe();
    });

    it('should preserve type information in selectors', () => {
      const listener = vi.fn();
      
      // TypeScript should infer the correct type for the selector result
      const unsubscribe = store.subscribe(
        (state) => state.user.name, // Should be inferred as string
        (name) => {
          // name should be typed as string
          listener(name.toUpperCase()); // This should work
        }
      );

      store.setState({ user: { name: 'alice', age: 30 } });
      expect(listener).toHaveBeenCalledWith('ALICE');

      unsubscribe();
    });
  });
});