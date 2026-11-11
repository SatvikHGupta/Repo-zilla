import { Component } from 'react';
import { ErrorState } from '../ui/State/State.jsx';

// last line of defence: a render error shows a message with a reload button instead of a blank page
export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('RepoZilla render error:', error, info.componentStack); }
  render() {
    if (!this.state.error) return this.props.children;
    return <ErrorState title="This page crashed" error={this.state.error} onRetry={() => window.location.reload()} />;
  }
}
