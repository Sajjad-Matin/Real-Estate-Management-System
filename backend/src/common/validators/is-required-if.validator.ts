import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsRequiredIf(property: string, value: any, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isRequiredIf',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property, value],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName, relatedValue] = args.constraints;
          const relatedPropertyValue = (args.object as any)[relatedPropertyName];
          
          // If the related property matches the value, this field is required
          if (relatedPropertyValue === relatedValue) {
            return value !== undefined && value !== null && value !== '';
          }
          return true; // Otherwise optional
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName, relatedValue] = args.constraints;
          return `${args.property} is required when ${relatedPropertyName} is ${relatedValue}`;
        },
      },
    });
  };
}