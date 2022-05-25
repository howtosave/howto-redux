import { render } from '@testing-library/react';

import ReduxFundamentalDemo from './redux-fundamental-demo';

describe('ReduxFundumentalDemo', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReduxFundamentalDemo />);
    expect(baseElement).toBeTruthy();
  });
});
