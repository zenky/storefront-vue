import { AuthenticationPhone, Customer } from '@zenky/api';
import { ComputedRef, Ref } from 'vue';
import { AddressForm } from '../addresses/index.js';

export enum AuthenticationStage {
  Check = 'check',
  Login = 'login',
  Register = 'register',
  Confirmation = 'confirmation',
}

export enum AuthenticationEvent {
  Stage = 'stage',
  Completed = 'completed',
}

export enum AuthenticationResultType {
  Pending = 'pending',
  Validation = 'validation',
  Failed = 'failed',
  Completed = 'completed',
  Stage = 'stage',
}

export type EmitAuthenticationEvent = (e: AuthenticationEvent, payload?: any) => void;

export type CustomerStore = {
  inclusions: string;
  loading: boolean;
  loaded: boolean;
  token: string | null;
  customer: Customer | null;
};

export interface AuthenticationForm {
  phone: AuthenticationPhone;
  password: string;
  confirmation_code: string;
}

export interface AuthenticationFormProvider {
  form: Ref<AuthenticationForm>;
  stage: Ref<AuthenticationStage>;
  reset: () => void;
}

export interface AuthenticationResult {
  type: AuthenticationResultType;
  data?: any;
}

export interface AuthenticationStatusCheckerProvider {
  active: Ref<boolean>;
  check: () => Promise<AuthenticationResult>;
}

export interface LoginProvider {
  active: Ref<boolean>;
  login: () => Promise<AuthenticationResult>;
}

export interface RegistrationProvider {
  active: Ref<boolean>;
  register: () => Promise<AuthenticationResult>;
}

export interface LogoutProvider {
  logout: () => void;
}

export interface PasswordResetProvider {
  active: Ref<boolean>;
  sent: Ref<boolean>;
  seconds: Ref<number>;
  label: ComputedRef<string>;
  request: () => Promise<AuthenticationResult>;
  reset: () => Promise<AuthenticationResult>;
}

export interface ConfirmationProvider {
  active: Ref<boolean>;
  seconds: Ref<number>;
  label: ComputedRef<string>;
  start: () => void;
  resend: () => Promise<AuthenticationResult>;
  confirm: (withPassword: boolean) => Promise<AuthenticationResult>;
}

export interface EditAddressFormProvider {
  form: Ref<AddressForm>;
  saving: Ref<boolean>;
  save: () => Promise<boolean>;
}
