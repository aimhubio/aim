import './TagSettingForm.less';

import React from 'react';
import UI from '../../../ui';
import { classNames } from '../../../utils';

class TagSettingForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      form: {
        name: '',
        color: '',
      },
    };

    this.colors = [
      '#16A085',
      '#27AE60',
      '#2980B9',
      '#8E44AD',
      '#E67E22',
      '#F1C40F',
      '#E74C3C',
      '#B33771',
      '#BDC581',
      '#FD7272',
      '#546de5',
      '#574b90',
    ];
  }

  componentDidMount() {
    if (this.props.name || this.props.color) {
      this.setForm(this.props.name, this.props.color);
    }
  }

  getForm = () => {
    return {
      name: this.state.form.name,
      color: this.state.form.color,
      id: this.props.tag_id ? this.props.tag_id : null,
    };
  };

  setForm = (name, color) => {
    this.setState({
      form: {
        name,
        color,
      },
    });
  };

  handleColorClick = (color) => {
    this.setState(
      (prevState) => ({
        ...prevState,
        form: {
          ...prevState.form,
          color,
        },
      }),
      () => {
        if (this.props.onUpdate) {
          this.props.onUpdate();
        }
      },
    );
  };

  handleInputChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    this.setState(
      (prevState) => ({
        ...prevState,
        form: {
          ...prevState.form,
          [name]: value,
        },
      }),
      () => {
        if (this.props.onUpdate) {
          this.props.onUpdate();
        }
      },
    );
  };

  render() {
    return (
      <div className='TagSettingForm'>
        <div className='TagSettingForm__field__wrapper'>
          <UI.Input
            onChange={this.handleInputChange}
            name='name'
            value={this.state.form.name}
            label='Tag Name'
            placeholder={'best-cnn'}
          />
        </div>
        <div className='TagSettingForm__field__wrapper'>
          <UI.Input
            onChange={this.handleInputChange}
            name='color'
            value={this.state.form.color}
            label='Tag Color'
            placeholder={'red'}
          />
          <div>
            {this.colors.map((color, cKey) => (
              <UI.Label
                className={classNames({
                  HubTagCreateScreen__colors__item: true,
                  active: this.state.form.color === color,
                })}
                color={color}
                key={cKey}
                onClick={() => this.handleColorClick(color)}
              >
                {color}
              </UI.Label>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default TagSettingForm;
