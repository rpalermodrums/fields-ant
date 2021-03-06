/* global it, describe, expect */

import React from 'react';
import faker from 'faker';
import { Tester } from '@mighty-justice/tester';
import * as Antd from 'antd';

import { FormCard } from '../../src';

function changeInput (component, value) {
  component.simulate('focus');
  component.simulate('change', { target: { value } });
  component.simulate('blur');
}

describe('FormCard', () => {
  it('Edits text', async () => {
    const text = faker.lorem.sentence()
      , newText = faker.lorem.sentence()
      , title = 'testing'
      , onSave = jest.fn().mockResolvedValue({})
      , props = {
        cardConfig: {
          fieldSets: [[{ field: 'text' }]],
          title,
        },
        model: { text },
        onSave,
      };

    const tester = await new Tester(FormCard, { props }).mount();

    changeInput(tester.find('input'), newText);

    expect(onSave).not.toHaveBeenCalled();
    tester.find('form').simulate('submit');
    await tester.sleep();
    expect(onSave).toHaveBeenCalledWith({ text: newText });
  });

  it('Maps backend errors to fields on form', async () => {
    const nameError = faker.lorem.sentence()
      , otherError = faker.lorem.sentence()
      , response = { response: { data: {
        'non_field_errors': [otherError],
        'plaintiff': [{ 'name': [nameError] }],
      }}}
      , name = faker.lorem.sentence()
      , onSave = jest.fn().mockRejectedValue(response)
      , props = {
        cardConfig: {
          fieldSets: [[{ field: 'name' }]],
          title: 'Information',
        },
        model: { name },
        onSave,
      };

    spyOn(Antd.notification, 'error');
    const tester = await new Tester(FormCard, { props }).mount();

    expect(Antd.notification.error).not.toHaveBeenCalled();
    expect(tester.text()).not.toContain(nameError);

    tester.find('form').simulate('submit');
    await tester.sleep();

    expect(Antd.notification.error).toHaveBeenCalled();
    const antErrorCall = Antd.notification.error.calls.mostRecent();
    expect(JSON.stringify(antErrorCall)).toContain(otherError);
  })
});
