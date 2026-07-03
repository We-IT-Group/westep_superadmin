import {FormikProps} from "formik";

interface InputProps<T> {
    type?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    name: keyof T;
    formik: FormikProps<T>;
}

const Input = <T extends Record<string, any>>({
                                                  type = "text",
                                                  name,
                                                  placeholder,
                                                  className = "",
                                                  disabled = false,
                                                  formik
                                              }: InputProps<T>) => {
    let inputClasses = ` h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${className}`;

    if (disabled) {
        inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 opacity-40`;
    } else {
        inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90  dark:focus:border-brand-800`;
    }

    return (
        <div className="relative">
            <input
                type={type}
                id={name as string}
                name={name as string}
                value={formik.values[name]}
                onChange={formik?.handleChange}
                onBlur={formik?.handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                className={inputClasses}
            />

            {formik?.errors[name] && formik?.touched[name] && (
                <p
                    className={`mt-1.5 text-xs ${
                        formik?.errors[name] && formik.touched[name]
                        && "text-error-500"}`}
                >
                    {formik?.errors[name] as string}
                </p>
            )}
        </div>
    );
};

export default Input;
