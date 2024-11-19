import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Result = { 'Ok' : null } |
  { 'Err' : string };
export type Role = { 'Viewer' : null } |
  { 'Editor' : null } |
  { 'Owner' : null };
export interface Trie { 'root' : TrieNode }
export interface TrieNode {
  'value' : [] | [Role],
  'children' : Array<[string, TrieNode]>,
}
export interface _SERVICE {
  'c2c_delete_permission' : ActorMethod<[string], Result>,
  'c2c_get_permission' : ActorMethod<[string], [] | [Role]>,
  'c2c_get_subkeys' : ActorMethod<[string], [] | [Array<[string, Role]>]>,
  'c2c_set_permission' : ActorMethod<[string, Role], Result>,
  'inspect_permissions' : ActorMethod<[], Trie>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
