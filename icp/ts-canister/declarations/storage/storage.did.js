export const idlFactory = ({ IDL }) => {
  const Role = IDL.Variant({
    'Viewer' : IDL.Null,
    'Editor' : IDL.Null,
    'Owner' : IDL.Null,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  const FileInfo = IDL.Record({
    'id' : IDL.Nat32,
    'owner' : IDL.Principal,
    'hash' : IDL.Vec(IDL.Nat8),
    'name' : IDL.Text,
    'mime_type' : IDL.Text,
    'total_size' : IDL.Nat64,
    'organization_id' : IDL.Nat,
    'chunks' : IDL.Nat64,
    'delegated_organization_ids' : IDL.Vec(IDL.Nat),
  });
  const FileChunk = IDL.Record({
    'hash' : IDL.Vec(IDL.Nat8),
    'chunk' : IDL.Vec(IDL.Nat8),
  });
  const Result_1 = IDL.Variant({ 'Ok' : FileChunk, 'Err' : IDL.Text });
  const SharedLink = IDL.Record({
    'token' : IDL.Text,
    'max_uses' : IDL.Opt(IDL.Nat64),
    'uses' : IDL.Nat64,
    'shared_by' : IDL.Principal,
    'expires_at' : IDL.Opt(IDL.Nat64),
    'file_id' : IDL.Nat32,
  });
  const FileWithRole = IDL.Record({
    'file' : FileInfo,
    'role' : IDL.Opt(Role),
  });
  const Result_2 = IDL.Variant({ 'Ok' : FileInfo, 'Err' : IDL.Text });
  return IDL.Service({
    'add_member' : IDL.Func([IDL.Nat32, IDL.Principal, Role], [Result], []),
    'create_file' : IDL.Func(
        [
          IDL.Nat,
          IDL.Vec(IDL.Nat),
          IDL.Text,
          IDL.Text,
          IDL.Nat64,
          IDL.Vec(IDL.Nat8),
        ],
        [IDL.Nat32],
        [],
      ),
    'get_file' : IDL.Func([IDL.Nat32], [FileInfo], ['composite_query']),
    'get_file_chunk' : IDL.Func(
        [IDL.Nat32, IDL.Nat32],
        [Result_1],
        ['composite_query'],
      ),
    'get_file_members' : IDL.Func(
        [IDL.Nat32],
        [IDL.Vec(IDL.Tuple(IDL.Principal, Role))],
        ['composite_query'],
      ),
    'get_file_shares' : IDL.Func(
        [IDL.Nat32],
        [IDL.Vec(SharedLink)],
        ['composite_query'],
      ),
    'get_files_for_organization' : IDL.Func(
        [IDL.Nat],
        [IDL.Vec(FileWithRole)],
        ['composite_query'],
      ),
    'get_files_for_self' : IDL.Func(
        [],
        [IDL.Vec(FileWithRole)],
        ['composite_query'],
      ),
    'get_shared_file_chunk' : IDL.Func(
        [IDL.Nat32, IDL.Nat32, IDL.Text],
        [Result_1],
        [],
      ),
    'get_shared_file_info' : IDL.Func(
        [IDL.Nat32, IDL.Text],
        [Result_2],
        ['query'],
      ),
    'put_chunk' : IDL.Func([IDL.Nat32, IDL.Nat32, FileChunk], [Result], []),
    'remove_file' : IDL.Func([IDL.Nat32], [Result], []),
    'remove_member' : IDL.Func([IDL.Nat32, IDL.Principal], [Result], []),
    'remove_share' : IDL.Func([IDL.Nat32, IDL.Text], [], []),
    'rename_file' : IDL.Func([IDL.Nat32, IDL.Text], [Result], []),
    'share_file' : IDL.Func(
        [IDL.Nat32, IDL.Opt(IDL.Nat64), IDL.Opt(IDL.Nat64)],
        [SharedLink],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return [IDL.Text]; };
