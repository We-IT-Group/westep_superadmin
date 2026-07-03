import dateIcon from "../../../assets/icon/date.svg";
import eye from "../../../assets/icon/eye.svg";
import eyeSlash from "../../../assets/icon/eye-slash.svg";
import {useState} from "react";
import {FormikProps} from "formik";

type InputFieldProps<T> = {
    label?: string;
    type?: string;
    name: keyof T;
    formik: FormikProps<T>;
    placeholder?: string;
    icon?: React.ReactNode;
    className?: string;
};

const InputField = <T extends Record<string, any>>({
                                                       label = "",
                                                       type = "text",
                                                       name,
                                                       formik,
                                                       placeholder,
                                                       icon = null,
                                                       className = "",
                                                       ...rest
                                                   }: InputFieldProps<T>) => {
    const [changeType, setChangeType] = useState<string>(type);

    return (
        <div className={`${className} mb-4 w-full`}>
            {label && (
                <label
                    htmlFor={name as string}
                    className="block text-base font-medium text-gray-200 mb-2"
                >
                    {label}
                </label>
            )}

            <div className="relative w-full block">
                <input
                    type={changeType}
                    id={name as string}
                    name={name as string}
                    value={formik.values[name]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={placeholder}
                    className={`w-full h-[52px] rounded-full border border-gray-400 bg-transparent text-[16px] md:text-[18px] px-4 md:px-10 py-3 text-lg text-gray-900 placeholder-gray-500 focus:outline-none  focus:border-brand-500`}
                    {...rest}
                />

                {/* 📅 Date yoki custom icon uchun */}
                {(type === "date" || icon) && (
                    <span className="absolute top-1/2 right-5 -translate-y-1/2 text-gray-500 pointer-events-none">
            {icon || (
                <img
                    src={dateIcon}
                    width={24}
                    height={24}
                    alt="date_icon"
                    className="opacity-80"
                />
            )}
          </span>
                )}

                {type === "password" && (
                    <span className="absolute top-1/2 right-5 -translate-y-1/2 text-gray-500 cursor-pointer">
            {changeType === "text" ? (
                <img
                    onClick={() => setChangeType("password")}
                    src={eye}
                    width={22}
                    height={22}
                    alt="hide_password"
                />
            ) : (
                <img
                    onClick={() => setChangeType("text")}
                    src={eyeSlash}
                    width={22}
                    height={22}
                    alt="show_password"
                />
            )}
          </span>
                )}
            </div>

            {formik.errors[name] && formik.touched[name] ? (
                <p className="text-sm text-red-500 mt-2 ml-3">
                    {formik.errors[name] as string}
                </p>
            ) : null}
        </div>
    );
};

export default InputField;