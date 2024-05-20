import React from "react";

/**
 * An ErrorBoundary component which is the error handler of last resort for any
 * errors which occur while the app is running and are not handled elsewhere.
 *
 * There are two major categories of such error.
 * 1) errors which occur in child components during rendering.
 *    Relevant reading: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 * 2) errors which occur in promises that don't have a trailing catch clause.
 *    More info on the "unhandled rejection" event: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch#description
 *
 * Closing an error popup will restore the app UI but does nothing to resolve the
 * underlying error.
 */
export default class AppError extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    // Bind the onUnhandledRejection function to this context so that it can update this.state.
    this.onUnhandledRejection = this.onUnhandledRejection.bind(this);
  }

  static getDerivedStateFromError(error) {
    // Update this.state so the next render will show the fallback UI.
    return { error: { 'message': error.message, 'stack': error.stack } };
  }

  onUnhandledRejection(event) {
    this.setState({
      error: {
        'type': event.reason.name,
        'message': event.reason.message,
        'stack': event.reason.stack
      }
    });
    // Log to console since this is a more informative representation than just the data displayed on screen.
    console.log(event);
  }

  componentDidMount() {
    window.addEventListener('unhandledrejection', this.onUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.onUnhandledRejection);
  }

  componentDidCatch(error, info) {
    console.log(error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      const summary = Object.entries(this.state.error).map(([key, val], i) =>
        <li key={key}>
          <span className="label">{key} : </span>
          <pre className="content">{val}</pre>
        </li>
      );
      const jsonObj = JSON.stringify(this.state.error);
      return (<>
        <div className="errorPopup animate fadeInUp one">
          <button
            style={{ width: "3%", display: "block" }}
            onClick={() => {
              this.setState({ error: null })
            }}
            className="closeButton">
            <img></img>
          </button>
          <h1>The app encountered an Error</h1>
          <ul>{summary}</ul>
        </div>
      </>);
    }

    // Make this component invisible when there's no error, or after the alert has
    // been dismissed.
    return this.props.children;
  }
}