import * as v from "valibot"

const schemaEmail = v.pipe(v.string(), v.email("Недопустимый адрес почты"))

const schemaPassword = v.pipe(
	v.string(),
	v.minLength(4, "Минимум 4 символа"), // todo - 4
	v.maxLength(30, "Максимум 30 символов"),
	// v.regex(/[a-z]/, "Your password must contain a lowercase letter."),
	// v.regex(/[A-Z]/, "Your password must contain a uppercase letter."),
	// v.regex(/[0-9]/, "Your password must contain a number."),
	v.regex(/^\S*$/, "Без пробелов")
)

const schemaAuth = {
	email: schemaEmail,
	password: schemaPassword,
}

export const schemaRegister = v.pipe(
	v.object({
		...schemaAuth,
		newPassword: v.string(),
	}),
	v.forward(
		v.partialCheck(
			[["password"], ["newPassword"]],
			(input) => input.password === input.newPassword,
			"Пароли не совпадают"
		),
		["newPassword"]
	)
)

export const schemaLogin = v.pipe(v.object(schemaAuth))
export const schemaReset = v.pipe(v.object({ email: schemaEmail }))

export const schemaConfirm = v.pipe(
	v.object({
		password: schemaPassword,
		newPassword: v.string(),
	}),
	v.forward(
		v.partialCheck(
			[["password"], ["newPassword"]],
			(input) => input.password === input.newPassword,
			"Пароли не совпадают"
		),
		["newPassword"]
	)
)

export type TSchemaLogin = v.InferOutput<typeof schemaLogin>
export type TSchemaRegister = v.InferOutput<typeof schemaRegister>
export type TSchemaReset = v.InferOutput<typeof schemaReset>
export type TSchemaConfirm = v.InferOutput<typeof schemaConfirm>

export type TSchema = TSchemaLogin | TSchemaRegister | TSchemaReset | TSchemaConfirm

export type ValiSchema =
	| typeof schemaLogin
	| typeof schemaRegister
	| typeof schemaReset
	| typeof schemaConfirm

export const SCHEMAS = {
	login: schemaLogin,
	register: schemaRegister,
	reset: schemaReset,
	confirm: schemaConfirm,
} as const


