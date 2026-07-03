import {useFormik} from "formik";
import * as Yup from "yup";
import PhoneNumberInput from "../../components/form/PhoneNumberInput.tsx";
import {useLogin} from "../../api/auth/useAuth.ts";
import InputField from "../form/input/AuthInput.tsx";
import CommonButton from "../ui/button/AuthButton.tsx";

export default function LoginForm() {
    const {mutateAsync, isPending} = useLogin();

    const formik = useFormik({
        initialValues: {
            phone: "",
            password: "",
        },
        validationSchema: Yup.object().shape({
            phone: Yup.string()
                .required("Telefon raqami xato kiritildi!")
                .length(12, "Telefon raqami xato kiritildi!"),
            password: Yup.string()
                .required("Parolni kiriting!")
                .min(4, "Parol kamida 4 ta belgidan iborat bo‘lishi kerak!"),
        }),
        onSubmit: async (values) => {
            await mutateAsync(values);
        },
    });

    return (
        <section className="flex items-center justify-center w-full">
            <div className="w-full max-w-lg animate-fadeIn">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        formik.handleSubmit();
                        return false;
                    }}
                    className="bg-transparent"
                >
                    <p className="text-2xl text-gray-900 font-semibold text-center mb-8">
                        Superadmin
                    </p>

                    <div className="space-y-6">
                        <PhoneNumberInput name="phone" formik={formik} className=""/>
                        <InputField name="password" placeholder="Parol" formik={formik} type={"password"}/>
                    </div>

                    <div className="mt-8 w-full">
                        <CommonButton
                            type="submit"
                            children={"Kirish"}
                            variant="primary"
                            isPending={isPending}
                        />
                    </div>
                </form>
            </div>
        </section>
    );
}