import React from 'react';
import { 
  AppState, 
  AppActions,
  store,
  actions,
  wrapper,
} from './01-basic-store.spec';
import { fireEvent, render, screen } from '@testing-library/react';
import { connect, ConnectedProps } from "react-redux";

// map the store state to the component props
const mapStateToProps = (state: AppState) => ({
  value: state.value
});

// redux connector
const connector = connect(mapStateToProps);

interface AppProps extends ConnectedProps<typeof connector>{
  actions: AppActions, 
}

const App: React.FC<AppProps> = ({
  value,
  dispatch,
  actions,
}) => (
  <div>
    <p>current value: {value}</p>
    <button onClick={() => dispatch(actions.increment())}>Increment 1</button>
    <button onClick={() => dispatch(actions.increment(2))}>Increment 2</button>
    <button onClick={() => dispatch(actions.decrement())}>Decrement 1</button>
    <button onClick={() => dispatch(actions.decrement(2))}>Decrement 2</button>
  </div>
);

const ConnectedApp = connector(App);

//
// test
//
test('# with react', () => {
  const { baseElement } = render(<ConnectedApp actions={actions} />, { wrapper });
  expect(baseElement).toBeTruthy();

  // initial state
  expect(store.getState()).toEqual({value: 0});
  expect(screen.getByText(/current value: 0/i)).toBeTruthy();

  // click increment
  fireEvent.click(
    screen.getByRole('button', {name: /increment 1/i}),
  );
  expect(store.getState()).toEqual({value: 1});
  expect(screen.getByText(/current value: 1/i)).toBeTruthy();

  fireEvent.click(
    screen.getByRole('button', {name: /increment 2/i}),
  );
  expect(store.getState()).toEqual({value: 3});
  expect(screen.getByText(/current value: 3/i)).toBeTruthy();

  // click decrement
  fireEvent.click(
    screen.getByRole('button', {name: /decrement 2/i}),
  );
  expect(store.getState()).toEqual({value: 1});
  expect(screen.getByText(/current value: 1/i)).toBeTruthy();

  fireEvent.click(
    screen.getByRole('button', {name: /decrement 1/i}),
  );
  expect(store.getState()).toEqual({value: 0});
  expect(screen.getByText(/current value: 0/i)).toBeTruthy();
});

//
// Defining mapDispatchToProps(MDP) As An Object
//

// redux connector
const connectorMDP = connect(mapStateToProps, actions);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AppMDPProps extends ConnectedProps<typeof connectorMDP>{
}

const AppMDP: React.FC<AppMDPProps> = ({
  value,
  increment,
  decrement,
}) => (
  <div>
    <p>current value: {value}</p>
    <button onClick={() => increment()}>Increment 1</button>
    <button onClick={() => increment(2)}>Increment 2</button>
    <button onClick={() => decrement()}>Decrement 1</button>
    <button onClick={() => decrement(2)}>Decrement 2</button>
  </div>
);

const ConnectedAppMDP = connectorMDP(AppMDP);

test('# with react MDP', () => {
  const { baseElement } = render(<ConnectedAppMDP />, { wrapper });
  expect(baseElement).toBeTruthy();
});
