import React from 'react';
import UI from '../../../ui';

class DangerZone extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deleteNameMatch: null,
      deleteNameMatchStatus: null,
    };
  }

  handleDeleteButtonClick = () => {
    if (this.state.deleteNameMatch === this.props.name) {
      this.setState({
        deleteNameMatchStatus: null,
      });
      this.props.onDelete();
      this.setState({
        deleteNameMatch: '',
      });
    } else {
      this.setState({
        deleteNameMatchStatus: 'Name does not match',
      });
    }
  };

  handleInputChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    this.setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  handleRevertButtonClick = () => {
    this.props.onRevert();
  };

  _renderDeleteContent = () => (
    <>
      <UI.Text type='grey-dark' spacing>
        {this.props.message}
      </UI.Text>
      <UI.Input
        onChange={this.handleInputChange}
        name='deleteNameMatch'
        value={this.state.deleteNameMatch}
        label={`Please type "${this.props.name}" to confirm`}
      />
      {!!this.state.deleteNameMatchStatus && (
        <UI.Text type='negative' spacingTop small>
          {' '}
          {this.state.deleteNameMatchStatus}{' '}
        </UI.Text>
      )}
      <UI.Text spacingTop>
        <UI.Button
          className='DangerZone__delete'
          onClick={() => this.handleDeleteButtonClick()}
          type='negative'
        >
          Hide
        </UI.Button>
      </UI.Text>
    </>
  );

  _renderRevertContent = () => (
    <>
      <UI.Text type='grey-dark' spacing>
        <strong>{this.props.name}</strong> is hidden
      </UI.Text>
      <UI.Text spacingTop>
        <UI.Button
          className='DangerZone__delete'
          onClick={() => this.handleRevertButtonClick()}
          type='secondary'
        >
          Bring back
        </UI.Button>
      </UI.Text>
    </>
  );

  render() {
    return (
      <>
        <UI.Segment className='DangerZone' type='negative'>
          {this.props.is_hidden
            ? this._renderRevertContent()
            : this._renderDeleteContent()}
        </UI.Segment>
      </>
    );
  }
}

export default DangerZone;
