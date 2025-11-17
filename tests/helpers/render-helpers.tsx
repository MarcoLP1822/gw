import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';

/**
 * Custom render function che wrappa i componenti con i provider necessari
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
    // Se in futuro aggiungi provider (es. ThemeProvider, QueryClientProvider)
    // puoi wrapparli qui
    const AllTheProviders = ({ children }: { children: ReactNode }) => {
        return <>{children}</>;
    };

    return render(ui, { wrapper: AllTheProviders, ...options });
}

/**
 * Helper per simulare input utente in un campo di testo
 */
export async function fillInput(input: HTMLElement, value: string) {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    await user.clear(input);
    await user.type(input, value);
}

/**
 * Helper per simulare click su un elemento
 */
export async function clickElement(element: HTMLElement) {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    await user.click(element);
}

/**
 * Helper per aspettare che un elemento scompaia
 */
export async function waitForElementToBeRemoved(element: HTMLElement) {
    return new Promise<void>((resolve) => {
        const checkRemoved = () => {
            if (!document.contains(element)) {
                resolve();
            } else {
                setTimeout(checkRemoved, 50);
            }
        };
        checkRemoved();
    });
}

/**
 * Helper per trovare un bottone per il suo testo
 */
export function getButtonByText(container: HTMLElement, text: string) {
    const { getByRole } = require('@testing-library/react');
    return getByRole(container, 'button', { name: new RegExp(text, 'i') });
}

/**
 * Helper per verificare che un elemento sia disabilitato
 */
export function expectDisabled(element: HTMLElement) {
    expect(element).toBeDisabled();
}

/**
 * Helper per verificare che un elemento sia abilitato
 */
export function expectEnabled(element: HTMLElement) {
    expect(element).toBeEnabled();
}

/**
 * Helper per simulare il caricamento di un file
 */
export async function uploadFile(input: HTMLInputElement, file: File) {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    await user.upload(input, file);
}

/**
 * Helper per creare un file mock per i test
 */
export function createMockFile(
    name: string,
    size: number,
    type: string,
    content: string = 'mock content'
): File {
    const blob = new Blob([content], { type });
    return new File([blob], name, { type });
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { customRender as render };
