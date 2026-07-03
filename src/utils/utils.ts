export const setItem = <T>(name: string, data: T): void => {
    localStorage.setItem(name, JSON.stringify(data));
};

export const getItem = <T>(name: string): T | null => {
    const value = localStorage.getItem(name);
    return value ? JSON.parse(value) as T : null;
};


export const removeItem = (name: string): void => {
    localStorage.removeItem(name);
};