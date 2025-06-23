export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Validate habit structure
export const validateHabit = (habit: any): ValidationResult => {
  const errors: string[] = [];

  if (!habit || typeof habit !== 'object') {
    errors.push('Habit must be an object');
    return { isValid: false, errors };
  }

  if (!habit.id || typeof habit.id !== 'string') {
    errors.push('Habit must have a valid string ID');
  }

  if (!habit.name || typeof habit.name !== 'string') {
    errors.push('Habit must have a valid string name');
  }

  if (!habit.color || typeof habit.color !== 'string') {
    errors.push('Habit must have a valid string color');
  }

  if (!habit.createdAt || typeof habit.createdAt !== 'string') {
    errors.push('Habit must have a valid string createdAt date');
  }

  if (habit.frequency !== undefined && typeof habit.frequency !== 'number') {
    errors.push('Habit frequency must be a number');
  }

  if (habit.order !== undefined && typeof habit.order !== 'number') {
    errors.push('Habit order must be a number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate completions structure
export const validateCompletions = (completions: any): ValidationResult => {
  const errors: string[] = [];

  if (!completions || typeof completions !== 'object') {
    errors.push('Completions must be an object');
    return { isValid: false, errors };
  }

  for (const [habitId, dates] of Object.entries(completions)) {
    if (typeof habitId !== 'string') {
      errors.push('Completion habit ID must be a string');
      continue;
    }

    if (!dates || typeof dates !== 'object') {
      errors.push(`Completion dates for habit ${habitId} must be an object`);
      continue;
    }

    for (const [date, count] of Object.entries(dates as Record<string, any>)) {
      if (typeof date !== 'string') {
        errors.push(`Date key for habit ${habitId} must be a string`);
      }
      if (typeof count !== 'number') {
        errors.push(
          `Completion count for habit ${habitId} on ${date} must be a number`
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate settings structure
export const validateSettings = (settings: any): ValidationResult => {
  const errors: string[] = [];

  if (!settings || typeof settings !== 'object') {
    errors.push('Settings must be an object');
    return { isValid: false, errors };
  }

  const validSettings = [
    'weekStartsOnSunday',
    'showMonthLabels',
    'showDayLabels',
  ];

  for (const [key, value] of Object.entries(settings)) {
    if (!validSettings.includes(key)) {
      errors.push(`Unknown setting: ${key}`);
      continue;
    }

    if (typeof value !== 'boolean') {
      errors.push(`Setting ${key} must be a boolean`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Comprehensive validation for the entire app data structure
export const validateAppData = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Data must be an object');
    return { isValid: false, errors };
  }

  // Check required top-level fields
  if (!data.version || typeof data.version !== 'string') {
    errors.push('Data must have a valid version string');
  }

  if (!data.habits || !Array.isArray(data.habits)) {
    errors.push('Data must have a habits array');
  }

  if (!data.completions || typeof data.completions !== 'object') {
    errors.push('Data must have a completions object');
  }

  if (!data.settings || typeof data.settings !== 'object') {
    errors.push('Data must have a settings object');
  }

  if (!data.exportedAt || typeof data.exportedAt !== 'string') {
    errors.push('Data must have a valid exportedAt timestamp');
  }

  // Validate habits array
  if (Array.isArray(data.habits)) {
    data.habits.forEach((habit: any, index: number) => {
      const habitValidation = validateHabit(habit);
      if (!habitValidation.isValid) {
        errors.push(`Habit ${index}: ${habitValidation.errors.join(', ')}`);
      }
    });
  }

  // Validate completions
  if (data.completions) {
    const completionsValidation = validateCompletions(data.completions);
    if (!completionsValidation.isValid) {
      errors.push(`Completions: ${completionsValidation.errors.join(', ')}`);
    }
  }

  // Validate settings
  if (data.settings) {
    const settingsValidation = validateSettings(data.settings);
    if (!settingsValidation.isValid) {
      errors.push(`Settings: ${settingsValidation.errors.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Get a user-friendly error message from validation result
export const getValidationErrorMessage = (
  validation: ValidationResult
): string => {
  if (validation.isValid) {
    return '';
  }

  if (validation.errors.length === 1) {
    return validation.errors[0];
  }

  return `Multiple validation errors:\n${validation.errors.slice(0, 3).join('\n')}${
    validation.errors.length > 3 ? '\n...' : ''
  }`;
};
