import PhoneInput from "react-phone-number-input";
import { FormikProps } from "formik";

interface IPhoneNumberInputProps<T> {
    label?: string;
    name: keyof T;
    formik: FormikProps<T>;
    className?: string;
}

const PhoneNumberInput = <T extends Record<string, any>>({
                                                             label = "",
                                                             name,
                                                             formik,
                                                             className = "",
                                                         }: IPhoneNumberInputProps<T>) => {
    return (
        <div className={`${className} mb-3 w-full`}>
            {label && (
                <label
                    htmlFor={name as string}
                    className="block text-base font-medium text-gray-200 mb-2"
                >
                    {label}
                </label>
            )}

            <PhoneInput
                defaultCountry="UZ"
                value={formik.values[name] ? `+${formik.values[name] as string}` : ""}
                onChange={(e) => {
                    formik.setFieldValue(name as string, e?.replace("+", ""));
                }}
                international
                countryCallingCodeEditable={false}
                className="w-full rounded-full border border-gray-400 bg-transparent px-5 py-3 text-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {formik.errors[name] && formik.touched[name] ? (
                <p className="text-sm text-red-500 mt-2 ml-2">
                    {formik.errors[name] as string}
                </p>
            ) : null}
        </div>
    );
};

export default PhoneNumberInput;