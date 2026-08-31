import {test} from 'node:test';
import assert from 'node:assert/strict';
import {prepareContact,recipients} from '../site/app/contact.ts';
const valid=()=>{const data=new FormData();for(const [key,value] of Object.entries({firstName:'Test',lastName:'Person',company:'Lokaler Test',email:'test@example.test',subject:'Finanzberater-Anbindung',message:'Dies ist ausschließlich ein lokaler Formular-Test.',privacy:'on'}))data.set(key,value);return data;};
for(const [subject,recipient] of Object.entries(recipients))test('mail draft routes to '+recipient,()=>{
 const data=valid();data.set('subject',subject);const result=prepareContact(data);assert(!result.error);assert(result.href.startsWith('mailto:'+recipient+'?'));
 assert.equal(new URL(result.href).searchParams.get('subject'),subject);
 assert(new URL(result.href).searchParams.get('body').includes('test@example.test'));
});
for(const [field,value] of [['firstName',''],['lastName',' '],['company',''],['email','invalid'],['email','bad\r\nbcc:injected@example.test'],['phone','x'.repeat(51)],['subject','__proto__'],['message','short'],['message',' '.repeat(20)],['message','x'.repeat(2001)],['privacy',''],['website','bot'],['firstName','x'.repeat(101)],['lastName','Header\r\nInjection']])test('rejects invalid '+field+' input ('+value.length+')',()=>{
 const data=valid();data.set(field,value);const result=prepareContact(data);assert(result.error);assert(!result.href);
});
test('message is encoded only as body, never injected recipient headers',()=>{
 const data=valid();data.set('message','Test &bcc=other@example.test\r\nUnicode: äöü <script>alert(1)</script>');const result=prepareContact(data);const url=new URL(result.href);
 assert.equal(url.searchParams.get('bcc'),null);assert(url.searchParams.get('body').includes('&bcc=other@example.test'));
});
