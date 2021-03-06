'use strict';

import React from 'react';
import i18n from '../i18n';

import TopBar from './TopBarComponent';
import Loading from './LoadingComponent';

import api from '../api/api.js';

const airbrakeJs = require('airbrake-js');

require('es6-promise/auto');

require('styles/Template.scss');

class TemplateComponent extends React.Component {
  getChildContext() {
    return {
      'config': this.state.config,
      'logger': this.state.logger
    }
  }

  setLoggedIn(loggedIn) {
    this.setState({isLoggedIn: loggedIn});
  }

  constructor(props) {
    super(props);

    this.state = {
      config: null,
      isLoggedIn: false,
      setLoggedIn: this.setLoggedIn.bind(this),
      logger: {
        // eslint-disable-next-line no-console
        notify: function(msg) { console.error(msg); }
      }
    };
  }

  /**
   * Send errors to a logging system
   */
  setupErrorLogger() {
    var config = this.state.config,
      logger;

    if (config.logger) {
      logger = new airbrakeJs({
        projectId: config.logger.api_key,
        projectKey: config.logger.api_key,
        reporter: 'xhr',
        host: config.logger.host
      });

      this.setState({
        logger: logger
      });
    }
  }

  /**
   * Get the configuration file
   *
   * @return A promise
   */
  getConfig() {
    return fetch('/admin/config.json')
      .then(function(response) {
        return response
                .json()
                .then(function(json) {
                  return json;
                });
      });
  }

  /**
   * Get/parse config data.
   *
   * Called by React after the initial render.
   */
  componentDidMount() {
    var app = this;

    app
      .getConfig()
      .then(function(config) {
        let currentLocale = config.defaultLocale || 'en';

        // If we have locales in the config, figure out which language to
        // display to the user based on the current url
        if (config.locales) {
          let currentUrl = window.location.href;

          for (let i = 0; i < config.locales.length; i += 1) {
            let locale = config.locales[i];
            let pattern = new RegExp('^' + locale.prefix, 'i');

            if (currentUrl.search(pattern) !== -1) {
              currentLocale = locale.locale;
              break;
            }
          }
        }

        i18n.changeLanguage(currentLocale);
        config.currentLocale = currentLocale;

        app.setState(
          {
            config: config
          },
          app.setupErrorLogger
        );

        api.getPermissions(config.api_root)
          .then((data) => {
            if (data.directoryAdmin === true) {
              app.setState({
                userIsDirectoryAdmin: true
              });
            }
          } );
      })
      .catch(function(reason) {
        app.state.logger.notify(reason);
      });
  }

  render() {
    let jsx;
    let templateClassNames = 'template-component template';

    if (this.state.userIsDirectoryAdmin === true) {
      templateClassNames += ' user-is-admin';
    }

    if (this.state.config === null) {
      jsx = (<Loading />);
    } else {
      let childWithProps = React.cloneElement(this.props.children, this.state);

      jsx = (
        <div className={templateClassNames}>
          <TopBar isLoggedIn={this.state.isLoggedIn} setLoggedIn={this.state.setLoggedIn} />

          <main className="template__main">
            {childWithProps}
          </main>
        </div>
      );
    }

    return jsx;
  }
}

TemplateComponent.displayName = 'TemplateComponent';

TemplateComponent.childContextTypes = {
  'config': React.PropTypes.object,
  'logger': React.PropTypes.object
};

export default TemplateComponent;

