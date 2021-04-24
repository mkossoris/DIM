import ErrorPanel from 'app/shell/ErrorPanel';
import { errorLog } from 'app/utils/log';
import React from 'react';
import { reportException } from '../utils/exceptions';

interface Props {
  name: string;
}

interface State {
  error?: Error;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidCatch(error: Error, errorInfo) {
    this.setState({ error });
    errorLog(this.props.name, error, errorInfo);
    reportException(this.props.name, error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return <ErrorPanel error={this.state.error} />;
    }
    return this.props.children;
  }
}
