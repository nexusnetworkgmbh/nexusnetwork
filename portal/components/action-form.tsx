'use client';
import { useActionState, type ReactNode } from 'react';
import type { ActionState } from '@/lib/actions';
export function ActionForm({action,children,label='Speichern',disabled=false}:{action:(state:ActionState,data:FormData)=>Promise<ActionState>;children?:ReactNode;label?:string;disabled?:boolean}){
  const [state,submit,pending]=useActionState(action,{});
  return <form action={submit} className="action-form"><fieldset disabled={pending||disabled}>{children}<button className="primary" type="submit">{pending?'Wird verarbeitet …':label}</button></fieldset>{state.error&&<p className="alert error" role="alert">{state.error}</p>}{state.success&&<p className="alert" role="status">{state.success}</p>}</form>;
}
