export const idlFactory = ({ IDL }) => {
  const TrieNode = IDL.Rec();
  const Result = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  const Role = IDL.Variant({
    'Viewer' : IDL.Null,
    'Editor' : IDL.Null,
    'Owner' : IDL.Null,
  });
  TrieNode.fill(
    IDL.Record({
      'value' : IDL.Opt(Role),
      'children' : IDL.Vec(IDL.Tuple(IDL.Text, TrieNode)),
    })
  );
  const Trie = IDL.Record({ 'root' : TrieNode });
  return IDL.Service({
    'c2c_delete_permission' : IDL.Func([IDL.Text], [Result], []),
    'c2c_get_permission' : IDL.Func([IDL.Text], [IDL.Opt(Role)], ['query']),
    'c2c_get_subkeys' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, Role)))],
        ['query'],
      ),
    'c2c_set_permission' : IDL.Func([IDL.Text, Role], [Result], []),
    'inspect_permissions' : IDL.Func([], [Trie], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
