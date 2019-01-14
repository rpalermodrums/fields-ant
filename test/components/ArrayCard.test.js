
/* global it, describe, expect */
/* eslint-disable sort-keys */

import React from 'react';
import faker from 'faker';

import { ArrayCard } from '../../src';
import { Tester } from '@mighty-justice/tester';

describe('ArrayCard', () => {
  it('Renders', async () => {
    const text1 = faker.lorem.sentence()
      , text2 = faker.lorem.sentence()
      , title = faker.lorem.sentence()
      , props = {
        cardConfig: {
          fieldSets: [[{ field: 'text' }]],
          title,
        },
        model: [{ id: 1, text: text1 }, { id: 2,  text: text2 }],
      };

    const noLoading = await new Tester(ArrayCard, { props }).mount();
    expect(noLoading.text()).toContain(title);
    expect(noLoading.text()).toContain('Text');
    expect(noLoading.html()).toContain(text1);
    expect(noLoading.html()).toContain(text2);
  });
});