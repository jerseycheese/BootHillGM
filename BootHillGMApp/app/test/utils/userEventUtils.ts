/**
 * User Event Testing Utilities
 * 
 * Provides helper functions for simulating user interactions in tests.
 */

import userEvent from '@testing-library/user-event';
import { screen, waitFor, within } from '@testing-library/react';

/**
 * Helper function for filling multiple form fields at once
 * 
 * Usage:
 * ```
 * await fillFormFields({
 *   'Name': 'John Doe',
 *   'Email': 'john@example.com',
 *   'Subscribe': true  // for checkbox
 * });
 * ```
 */
export async function fillFormFields(fields: Record<string, string | boolean>) {
  const user = userEvent.setup();
  
  for (const [name, value] of Object.entries(fields)) {
    if (typeof value === 'boolean') {
      // Handle checkbox/radio
      try {
        const input = screen.getByRole('checkbox', { name: new RegExp(name, 'i') }) || 
                      screen.getByRole('radio', { name: new RegExp(name, 'i') });
        
        if ((input as HTMLInputElement).checked !== value) {
          await user.click(input);
        }
      } catch (e) {
        console.error(`Failed to find checkbox/radio with name: ${name}`);
        throw e;
      }
    } else {
      // Handle text input
      try {
        const input = screen.getByRole('textbox', { name: new RegExp(name, 'i') });
        await user.clear(input);
        await user.type(input, value);
      } catch (e) {
        console.error(`Failed to find textbox with name: ${name}`);
        throw e;
      }
    }
  }
}

/**
 * Helper for selecting an option from a dropdown
 * 
 * Usage:
 * ```
 * await selectOption('Country', 'United States');
 * ```
 */
export async function selectOption(labelText: string, optionText: string) {
  const user = userEvent.setup();
  const selectElement = screen.getByLabelText(new RegExp(labelText, 'i'));
  await user.selectOptions(selectElement, screen.getByText(optionText));
}

/**
 * Helper for clicking a button by text
 * 
 * Usage:
 * ```
 * await clickButton('Submit');
 * ```
 */
export async function clickButton(text: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: new RegExp(text, 'i') }));
}

/**
 * Helper for submitting a form
 * 
 * Usage:
 * ```
 * await submitForm('contact-form');
 * ```
 */
export async function submitForm(formTestId: string) {
  const user = userEvent.setup();
  const form = screen.getByTestId(formTestId);
  
  // Find submit button within the form
  const formElement = within(form);
  const submitButton = formElement.getByRole('button', { 
    name: /submit|save|send/i
  });
  
  await user.click(submitButton);
}

/**
 * Helper for testing modal interactions
 * 
 * Usage:
 * ```
 * await interactWithModal('confirm-dialog', 'confirm');
 * await interactWithModal('settings-modal', 'cancel');
 * ```
 */
export async function interactWithModal(modalTestId: string, action: 'confirm' | 'cancel') {
  const user = userEvent.setup();
  const modal = screen.getByTestId(modalTestId);
  
  const modalElement = within(modal);
  if (action === 'confirm') {
    await user.click(modalElement.getByRole('button', { name: /confirm|ok|yes|accept/i }));
  } else {
    await user.click(modalElement.getByRole('button', { name: /cancel|close|no|deny/i }));
  }
  
  // Wait for modal to close
  await waitFor(() => {
    expect(screen.queryByTestId(modalTestId)).not.toBeInTheDocument();
  });
}

/**
 * Helper for typing in a specific field
 * 
 * Usage:
 * ```
 * await typeInField('Username', 'john.doe');
 * ```
 */
export async function typeInField(labelText: string, value: string) {
  const user = userEvent.setup();
  const input = screen.getByLabelText(new RegExp(labelText, 'i'));
  await user.clear(input);
  await user.type(input, value);
}
