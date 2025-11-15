// Este arquivo contém uma solução para suprimir avisos específicos no console.

export function suppressRechartsWarning() {
    const originalWarn = console.warn;
    const warningToSuppress = "The width(-1) and height(-1) of chart should be greater than 0";

    console.warn = (...args: any[]) => {
        // Se o primeiro argumento for uma string e incluir o texto do aviso, não faça nada.
        if (typeof args[0] === 'string' && args[0].includes(warningToSuppress)) {
            return;
        }
        // Para todos os outros avisos, chame a função original.
        originalWarn.apply(console, args);
    };
}