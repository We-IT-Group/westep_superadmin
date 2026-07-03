function Spinner() {
    return (
        <div
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            role="status"
            aria-label="Loading..."
        />
    );
}

export default Spinner;