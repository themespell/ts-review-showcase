export function stringToBoolean(str) {
    const input = String(str).trim().toLowerCase();
    const truthyValues = ['true', 'yes', '1', 'on'];
    const falsyValues = ['false', 'no', '0', 'off', ''];

    if (truthyValues.includes(input)) {
        return true;
    }

    if (falsyValues.includes(input)) {
        return false;
    }

    console.warn(`Unrecognized input: "${str}". Defaulting to false.`);
    return false;
}