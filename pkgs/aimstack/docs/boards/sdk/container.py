ui.header('Container API reference')

ui.html("""
    Class <b>aim.Container</b> is a base building block for organizing metadata into the set of 
    interrelated objects and sequences. It provides the following capabilities:
    <ul>
        <li> Set/get Container attributes
        <li> Get and create Sequence associated with Container
        <li> Check container matches an expression
        <li> Filter containers matching an expression
        <li> Iterage over Container's sequences
    </ul> 
""")

ui.html("""
    Below is the list of methods available for Container class.
""")

########################################################################################################################
ui.subheader('Create Container')
ui.html('<b>Signature</b>')
ui.code("""
def __init__(
    self,
    hash_: Optional[str] = None, *,
    repo: Optional[Union[str, 'Repo']] = None,
    mode: Optional[Union[str, ContainerOpenMode]] = ContainerOpenMode.WRITE):
""")
ui.html('<b>Parameters</b>')
ui.table({
    'name': ['hash_', 'repo', 'mode'],
    'type': ['str', 'Union[str, Repo]', 'Union[str, ContainerOpenMode]'],
    'required': [False, False, False],
    'default': ['None', 'None', 'ContainerOpenMode.WRITE'],
    '': ['Container unique hash. If not specified, auto-generated.',
         'Aim repo path or Repo object',
         'Container open mode. WRITE by default.'],
}, {'required': lambda val: ui.switch(checked=val, size='sm', disabled=True)})

########################################################################################################################
ui.subheader('Filter Containers')
ui.html('<b>Signature</b>')
ui.code("""
@classmethod
def filter(cls, expr: str = '', repo: 'Repo' = None) -> 'ContainerCollection':
""")
ui.html('<b>Parameters</b>')
ui.table({
    'name': ['expr', 'repo'],
    'type': ['str', 'Repo'],
    'required': [False, False],
    'default': ['""', 'None'],
    '': ['Query expression',
         'Aim Repo object'],
}, {'required': lambda val: ui.switch(checked=val, size='sm', disabled=True)})

########################################################################################################################
ui.subheader('Set Container attribute')
ui.html('<b>Signature</b>')
ui.code("""
def __setitem__(self, key, value):
""")
ui.html('<b>Parameters</b>')
ui.table({
    'name': ['key', 'value'],
    'type': ['', ''],
    'required': [True, True],
    'default': ['-', '-'],
    '': ['Attribute path',
         'Attribute value'],
}, {'required': lambda val: ui.switch(checked=val, size='sm', disabled=True)})

########################################################################################################################
ui.subheader('Get Container attribute')
ui.html('<b>Signature</b>')
ui.code("""
def __getitem__(self, key):
""")
ui.html('<b>Parameters</b>')
ui.table({
    'name': ['key'],
    'type': [''],
    'required': [True],
    'default': ['-'],
    '': ['Attribute path'],
}, {'required': lambda val: ui.switch(checked=val, size='sm', disabled=True)})

########################################################################################################################
ui.subheader('Delete Container attribute')
ui.html('<b>Signature</b>')
ui.code("""
def __delitem__(self, key):
""")
ui.html('<b>Parameters</b>')
ui.table({
    'name': ['key'],
    'type': [''],
    'required': [True],
    'default': ['-'],
    '': ['Attribute path'],
}, {'required': lambda val: ui.switch(checked=val, size='sm', disabled=True)})

########################################################################################################################
ui.subheader('Check Container matches expression')
ui.html('<b>Signature</b>')
ui.code("""
def match(self, expr) -> bool:
""")
ui.html('<b>Parameters</b>')
ui.table({
    'name': ['expr'],
    'type': ['str'],
    'required': [True],
    'default': ['-'],
    '': ['Expression container should match'],
}, {'required': lambda val: ui.switch(checked=val, size='sm', disabled=True)})
ui.html('Returns True if container matches the expression, False otherwise.')

########################################################################################################################
ui.subheader('Get Container sequences')
ui.html('<b>Signature</b>')
ui.code("""
@property
def sequences(self) -> 'ContainerSequenceMap':
""")
ui.html('Returns set of sequences tracked in the context of container.')
