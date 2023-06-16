ui.header('Sequence API reference')

ui.html("""
    Class <b>aim.Sequence</b> provides an interface for tracking objects and retrieving sequence data.
    It enables convenient API for slicing and sampling the sequence in any given range, as well as ability
    to specify additional axis data.
""")
ui.html("""
    Below is the list of methods available for Container class.
""")

########################################################################################################################
ui.subheader('Create Sequence')
ui.html('<b>Signature</b>')
ui.code("""
def __init__(
    self,
    container: 'Container', *,
    name: str,
    context: _ContextInfo):
""")
ui.html('<b>Parameters</b>')
ui.table({
    'name': ['container', 'name', 'context'],
    'type': ['Container', 'str', 'Union[Dict, Context, int]'],
    'required': [True, True, True],
    'default': ['-', '-', '-'],
    '': ['Container objet to get sequence from',
         'Sequence name',
         'Sequence context. Could be either Context object, Python dictionary or Context id'],
}, {'required': lambda val: ui.switch(checked=val, size='sm', disabled=True)})

########################################################################################################################
ui.subheader('Filter Sequences')
ui.html('<b>Signature</b>')
ui.code("""
@classmethod
def filter(cls, expr: str = '', repo: 'Repo' = None) -> 'SequenceCollection':
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
ui.subheader('Get Sequence name')
ui.html('<b>Signature</b>')
ui.code("""
@property
def name(self) -> str:
""")
ui.html('Returns Sequence name.')

########################################################################################################################
ui.subheader('Get Sequence context')
ui.html('<b>Signature</b>')
ui.code("""
@property
def context(self) -> Dict:
""")
ui.html('Returns Sequence context as Python dict.')

########################################################################################################################
ui.subheader('Track values')
ui.html('<b>Signature</b>')
ui.code("""
def track(self, value: Any, *, step: Optional[int] = None, **axis):
""")
ui.html('<b>Parameters</b>')
ui.table({
    'name': ['value', 'step', 'axis'],
    'type': ['Any', 'int', 'kwargs'],
    'required': [True, False, False],
    'default': ['-', 'autoincrement', '{}'],
    '': ['Value to be tracked. Must be Aim storage compatible value',
         'Optional tracking step. If not specified, auto-incremented 0-based index.',
         'Additional axis values to be tracked.'],
}, {'required': lambda val: ui.switch(checked=val, size='sm', disabled=True)})

########################################################################################################################
ui.subheader('Get Sequence tracked objects type')
ui.html('<b>Signature</b>')
ui.code("""
@property
def type(self) -> str:
""")
ui.html('Returns common ancestor type for all tracked values.')

########################################################################################################################
ui.subheader('Check Sequence has tracked values')
ui.html('<b>Signature</b>')
ui.code("""
@property
def is_empty(self) -> bool:
""")
ui.html('Returns True if no values are tracked yet, False otherwise.')

########################################################################################################################
ui.subheader('Get Sequence first step')
ui.html('<b>Signature</b>')
ui.code("""
@property
def start(self) -> bool:
""")
ui.html('Returns value of first tracked step.')

########################################################################################################################
ui.subheader('Get Sequence last step')
ui.html('<b>Signature</b>')
ui.code("""
@property
def stop(self) -> bool:
""")
ui.html('Returns value of last tracked step.')

########################################################################################################################
ui.subheader('Check Sequence matches expression')
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
ui.html('Returns True if sequence matches the expression, False otherwise.')

########################################################################################################################
ui.subheader('Get Sequence additional axis')
ui.html('<b>Signature</b>')
ui.code("""
@property
def axis_names(self) -> Tuple[str]:
""")
ui.html('Returns names of additional axis.')

########################################################################################################################
ui.subheader('Get axis values')
ui.html('<b>Signature</b>')
ui.code("""
@property
def axis(self, name: str) -> Iterator[Any]:
""")
ui.html('<b>Parameters</b>')
ui.table({
    'name': ['name'],
    'type': ['str'],
    'required': [True],
    'default': ['-'],
    '': ['Name of additional axis to get values for'],
}, {'required': lambda val: ui.switch(checked=val, size='sm', disabled=True)})
ui.html('Returns iterator for the given axis values.')

########################################################################################################################
ui.subheader('Get Sequence values sample')
ui.html('<b>Signature</b>')
ui.code("""
def sample(self, k: int) -> List[Any]:
""")
ui.html('<b>Parameters</b>')
ui.table({
    'name': ['k'],
    'type': ['int'],
    'required': [True],
    'default': ['-'],
    '': ['Number of samples to return'],
}, {'required': lambda val: ui.switch(checked=val, size='sm', disabled=True)})
ui.html('Returns list of maximum <b>k</b> values, matching values distribution across entire sequence.')

########################################################################################################################
ui.subheader('Get Sequence view')
ui.html('<b>Signature</b>')
ui.code("""
def __getitem__(self, item: Union[slice, str, Tuple[str]]) -> 'SequenceView':
""")
ui.html('<b>Parameters</b>')
ui.table({
    'name': ['item'],
    'type': ['Union[slice, str, Tuple[str]]'],
    'required': [True],
    'default': ['-'],
    '': ['Axis name or steps range to get Sequence view for.'],
}, {'required': lambda val: ui.switch(checked=val, size='sm', disabled=True)})
ui.html('Returns SequenceView object for the given axis name or given steps range.')
