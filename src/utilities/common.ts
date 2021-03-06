import { get, isArray, sortBy } from 'lodash';

import * as Antd from 'antd';

import {
  getOrDefault,
  varToLabel,
} from '@mighty-justice/utils';

import {
  ICardConfig,
  IFieldConfig,
  IFieldConfigOptionSelect,
  IFieldConfigPartial,
  IFieldSet,
  IFieldSetPartial,
  IFieldSetSimple,
  IFieldSetSimplePartial,
  IInjected,
  IOption,
} from '../interfaces';

import { TYPES } from './types';

const typeDefaults = {
  editComponent: Antd.Input,
  fieldConfigProp: false,
  formValidationRules: {},
  fromForm: (value: any) => value,
  nullify: false,
  toForm: (data: any, field: string) => get(data, field, ''),
};

function stripFieldConfig (func: (...args: any[]) => any) {
  // tslint:disable-next-line no-unnecessary-callback-wrapper
  return (value: any) => func(value);
}

function getFieldSuffix (field?: string) {
  return (field || '').split('.').pop() || '';
}

// tslint:disable-next-line cyclomatic-complexity
function inferType (fieldConfig: Partial<IFieldConfig>) {
  if (fieldConfig.type) {
    return fieldConfig.type;
  }

  const field = getFieldSuffix(fieldConfig.field);

  if (field.includes('duration')) { return 'duration'; }
  if (field.includes('rating')) { return 'rating'; }
  if (field.includes('amount')) { return 'money'; }
  if (field.endsWith('_on')) { return 'date'; }
  if (field.startsWith('date')) { return 'date'; }
  if (field.endsWith('date')) { return 'date'; }
  if (field.endsWith('_at')) { return 'date'; }
  if (field.startsWith('is_')) { return 'boolean'; }
  if (field.includes('note')) { return 'text'; }
  if (field.includes('body')) { return 'text'; }
  if (field.includes('summary')) { return 'text'; }
  if (field.includes('percent')) { return 'percentage'; }

  return 'string';
}

export function isPartialFieldSetSimple (fieldSet: IFieldSetPartial): fieldSet is IFieldSetSimplePartial {
  return isArray(fieldSet);
}

export function isFieldSetSimple (fieldSet: IFieldSet): fieldSet is IFieldSetSimple {
  return isArray(fieldSet);
}

export function filterInsertIf (fieldConfig: IFieldConfig, model: any) {
  return fieldConfig.insertIf && !fieldConfig.insertIf(model);
}

export function fillInFieldConfig (fieldConfig: IFieldConfigPartial): IFieldConfig {
  const type = inferType(fieldConfig)
    , label = varToLabel(getFieldSuffix(fieldConfig.field));

  const requiredValidationRule = fieldConfig.required
    ? {
      required: {
        message: 'Field required',
        required: true,
      },
    } : undefined;

  return {
    // Universal defaults
    disabled: false,
    key: fieldConfig.field,
    label,
    populateFromSearch: false,
    populateNameFromSearch: false,
    readOnly: false,
    render: stripFieldConfig(getOrDefault),
    required: false,
    showLabel: true,
    type,
    writeOnly: false,

    // Overrides prioritized
    ...typeDefaults,
    ...TYPES[type],
    ...fieldConfig,

    // Merge nested object
    editProps: {
      ...fieldConfig.editProps,
      ...TYPES[type].editProps,
    },

    // Merge nested object
    formValidationRules: {
      ...fieldConfig.formValidationRules,
      ...TYPES[type].formValidationRules,
      ...requiredValidationRule,
    },
  };
}

export function fillInFieldSet (fieldSet: IFieldSetPartial): IFieldSet {
  // Fills in the defaults from common so we can keep configurations light
  if (isPartialFieldSetSimple(fieldSet)) {
    return fieldSet.map(fillInFieldConfig);
  }

  return {
    ...fieldSet,
    fields: fieldSet.fields.map(fillInFieldConfig),
  };
}

export function fillInFieldSets (fieldSets: IFieldSetPartial[]): IFieldSet[] {
  return fieldSets.map(fillInFieldSet);
}

export function getCardModel (model: any, cardConfig: ICardConfig) {
  const { accessor } = cardConfig;

  if (accessor) {
    return get(model, accessor);
  }

  return model;
}

export function getFieldSetFields (fieldSet: IFieldSet): IFieldConfig[] {
  if (isFieldSetSimple(fieldSet)) {
    return fieldSet;
  }

  return fieldSet.fields;
}

export function getUnsortedOptions (fieldConfig: IFieldConfigOptionSelect, injected: IInjected): IOption[] {
  const { options, optionType } = fieldConfig;

  if (options) { return options; }
  if (fieldConfig.getOptions && optionType) { return fieldConfig.getOptions(optionType); }
  if (injected.getOptions && optionType) { return injected.getOptions(optionType); }

  // istanbul ignore next
  throw new Error ('FieldConfig missing options, getOptions; getOptions not injected');
}

export function getOptions (fieldConfig: IFieldConfigOptionSelect, injected: IInjected): IOption[] {
  const unsortedOptions = getUnsortedOptions(fieldConfig, injected);
  return fieldConfig.sorted ? sortBy(unsortedOptions, 'name') : unsortedOptions;
}
