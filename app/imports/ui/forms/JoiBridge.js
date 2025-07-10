import { Bridge } from 'uniforms';

/**
 * Custom Joi bridge for uniforms since there's no official one for v4
 */
export class JoiBridge extends Bridge {
  constructor(schema) {
    super();
    this.schema = schema;
  }

  getError(name, error) {
    if (!error || !error.details) return null;
    const details = error.details.find(detail => detail.path.join('.') === name);
    return details ? details.message : null;
  }

  getErrorMessage(name, error) {
    const errorDetail = this.getError(name, error);
    return errorDetail || '';
  }

  getErrorMessages(error) {
    if (!error || !error.details) return [];
    return error.details.map(detail => detail.message);
  }

  getField(name) {
    const path = name.split('.');
    let current = this.schema;

    // eslint-disable-next-line no-restricted-syntax
    for (const key of path) {
      if (current._ids && current._ids._byKey && current._ids._byKey.has(key)) {
        current = current._ids._byKey.get(key).schema;
      } else {
        return null;
      }
    }

    return current;
  }

  getInitialValue(name) {
    const field = this.getField(name);
    if (!field) return undefined;

    // Extract default value from Joi schema
    if (field._flags && field._flags.default !== undefined) {
      return typeof field._flags.default === 'function'
        ? field._flags.default()
        : field._flags.default;
    }

    return undefined;
  }

  getProps(name) {
    const field = this.getField(name);
    if (!field) return {};

    const props = {
      required: !field._flags || !field._flags.presence || field._flags.presence === 'required',
    };

    return props;
  }

  getSubfields(name) {
    if (!name) {
      // Return root level fields
      if (this.schema._ids && this.schema._ids._byKey) {
        return Array.from(this.schema._ids._byKey.keys());
      }
    }

    const field = this.getField(name);
    if (field && field._ids && field._ids._byKey) {
      return Array.from(field._ids._byKey.keys());
    }

    return [];
  }

  getType(name) {
    const field = this.getField(name);
    if (!field) return 'string';

    if (field.type === 'string') return 'string';
    if (field.type === 'number') return 'number';
    if (field.type === 'boolean') return 'boolean';
    if (field.type === 'date') return 'date';
    if (field.type === 'array') return 'array';
    if (field.type === 'object') return 'object';

    return 'string';
  }

  getValidator() {
    return (model) => {
      const result = this.schema.validate(model, { abortEarly: false });
      if (result.error) {
        throw result.error;
      }
      return null;
    };
  }
}
