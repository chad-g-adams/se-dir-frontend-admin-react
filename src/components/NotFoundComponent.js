'use strict';

import React from 'react';

import { translate } from 'react-i18next';

class NotFoundComponent extends React.Component {
  render() {
    const { t } = this.props;

    return (
      <div className="page notfound-component">
        <p>{t('notFound:pageNotFound')}</p>
      </div>
    );
  }
}

NotFoundComponent.displayName = 'NotFoundComponent';

export { NotFoundComponent };
export default translate('notFound')(NotFoundComponent);
