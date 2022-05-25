import styles from './redux-fundamental-demo.module.css';

/* eslint-disable-next-line */
export interface ReduxFundamentalDemoProps {}

export function ReduxFundamentalDemo(props: ReduxFundamentalDemoProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to ReduxFundamentalDemo!</h1>
    </div>
  );
}

export default ReduxFundamentalDemo;
