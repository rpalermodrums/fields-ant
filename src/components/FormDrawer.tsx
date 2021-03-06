import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import autoBindMethods from 'class-autobind-decorator';
import SmartBool from '@mighty-justice/smart-bool';

import { Button, Divider, Drawer, Form } from 'antd';

import {
  ButtonToolbar,
  fillInFieldSets,
  FormFieldSet,
  FormManager,
  IFieldSetPartial,
} from '../';

interface IProps {
  fieldSets: IFieldSetPartial[];
  form: any;
  isVisible: SmartBool;
  model?: any;
  onSave: (args: any) => Promise<void>;
  onSuccess?: (args?: any) => void;
  title: string;
}

const DRAWER_WIDTH = 420;

@autoBindMethods
@observer
class BaseFormDrawer extends Component<IProps> {
  private formManager: FormManager;

  @computed
  private get fieldSets () {
    return fillInFieldSets(this.props.fieldSets);
  }

  public constructor (props: IProps) {
    super(props);

    const {
      form,
      isVisible,
      model,
      onSave,
      onSuccess,
    } = props;

    this.formManager = new FormManager(
      form,
      this.fieldSets,
      {
        model,
        onSave,
        onSuccess: onSuccess || isVisible.setFalse,
      },
    );
  }

  public render () {
    const { form, isVisible, model, title } = this.props;

    return (
      <Drawer
        closable
        destroyOnClose
        maskClosable={false}
        onClose={isVisible.setFalse}
        placement='right'
        title={title}
        visible={isVisible.isTrue}
        width={DRAWER_WIDTH}
      >
        <Form layout='vertical' hideRequiredMark onSubmit={this.formManager.onSave}>
          {this.fieldSets.map((fieldSet, idx) => (
            <div key={idx}>
              <FormFieldSet
                fieldSet={fieldSet}
                form={form}
                model={model}
              />
            </div>
          ))}
          <Divider />

          <ButtonToolbar align='right'>
            <Button disabled={this.formManager.saving} onClick={isVisible.setFalse} size='large'>Cancel</Button>
            <Button loading={this.formManager.saving} type='primary' htmlType='submit' size='large'>Submit</Button>
          </ButtonToolbar>
        </Form>
      </Drawer>
    );
  }
}

const FormDrawer = Form.create()(BaseFormDrawer);

export default FormDrawer;
