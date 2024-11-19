import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface FileChunk {
  'hash' : Uint8Array | number[],
  'chunk' : Uint8Array | number[],
}
export interface FileInfo {
  'id' : number,
  'owner' : Principal,
  'hash' : Uint8Array | number[],
  'name' : string,
  'mime_type' : string,
  'total_size' : bigint,
  'organization_id' : bigint,
  'chunks' : bigint,
  'delegated_organization_ids' : Array<bigint>,
}
export interface FileWithRole { 'file' : FileInfo, 'role' : [] | [Role] }
export type Result = { 'Ok' : null } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : FileChunk } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : FileInfo } |
  { 'Err' : string };
export type Role = { 'Viewer' : null } |
  { 'Editor' : null } |
  { 'Owner' : null };
export interface SharedLink {
  'token' : string,
  'max_uses' : [] | [bigint],
  'uses' : bigint,
  'shared_by' : Principal,
  'expires_at' : [] | [bigint],
  'file_id' : number,
}
export interface _SERVICE {
  'add_member' : ActorMethod<[number, Principal, Role], Result>,
  'create_file' : ActorMethod<
    [bigint, Array<bigint>, string, string, bigint, Uint8Array | number[]],
    number
  >,
  'get_file' : ActorMethod<[number], FileInfo>,
  'get_file_chunk' : ActorMethod<[number, number], Result_1>,
  'get_file_members' : ActorMethod<[number], Array<[Principal, Role]>>,
  'get_file_shares' : ActorMethod<[number], Array<SharedLink>>,
  'get_files_for_organization' : ActorMethod<[bigint], Array<FileWithRole>>,
  'get_files_for_self' : ActorMethod<[], Array<FileWithRole>>,
  'get_shared_file_chunk' : ActorMethod<[number, number, string], Result_1>,
  'get_shared_file_info' : ActorMethod<[number, string], Result_2>,
  'put_chunk' : ActorMethod<[number, number, FileChunk], Result>,
  'remove_file' : ActorMethod<[number], Result>,
  'remove_member' : ActorMethod<[number, Principal], Result>,
  'remove_share' : ActorMethod<[number, string], undefined>,
  'rename_file' : ActorMethod<[number, string], Result>,
  'share_file' : ActorMethod<
    [number, [] | [bigint], [] | [bigint]],
    SharedLink
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
