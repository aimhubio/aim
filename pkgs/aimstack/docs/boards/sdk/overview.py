ui.header('Python SDK Overview')

ui.html("""
    Aim provides a powerful SDK for metadata management.
    It allows users to define their own metadata types, via extensible type system.
    Additionally, Aim Python SDK provides capabilities of writing and reading data to Aim storage, 
    and enables pythonic query expressions for data exploration.
""")

ui.subheader('Main Concepts')

ui.html("""
    Aim Python SDK is centered around three main concepts, all of them describing a piece of metadata. 
    These concepts are <b>Object</b>, <b>Sequence</b> and <b>Container</b>.
    
    The <b>Object</b> represents an atomic single piece of metadata. It describes properties of metadata as well as 
    additional behavior (methods) applicable to it. 
    Examples of an Aim Object are: </b>Image</b>, </b>Distribution</b>, </b>Audio</b>.
    Each of these concrete object types describes what properties it has (f.e. </b>Image</b> has description, 
    format and data fields) which are serialized in Aim storage.

    <b>Sequence</b> is a collection of Objects representing lineage or change over the time. Examples of Aim 
    Sequence are Metric (sequence of numeric elements), ImageSequence, etc. Sequence provides ability 
    to read and sample the data within the given range. Sequence types might be extended to provide an 
    additional functionality, other data types adapters, etc. For example, Metric sequence provides 
    interface to dump it as a pandas DataFrame object.

    <b>Container</b> is a collection of interrelated Aim Objects and Sequences. It usually represents a set of 
    metadata and artifacts generated during a process, for example model training. Container provides 
    ability to create and browse object Sequences and set it's own parameters and attributes for future reference.
""")

ui.subheader('Working with metadata')

ui.html("""
    Now lets take a look how the above mentioned concepts are modeled and understand the basic usage of Aim Python SDK.
    Aim uses remote server based writes, which means that data access and tracking should be done in specific manner.
    Examples, of data access and tracking can be find below.
""")

ui.html("""
    Aim Python SDK provides 3 base classes; Object, Sequence and Container, each representing respective core concept.
    Additionally the <b>Repo</b> class represents a single project repository, where all the collected data resides.
    These four classes provide a complete system for storing and querying metadata, as well as extending already defined
    types. Below are examples of using Aim Python SDK to write and query data:
""")

ui.html("""
    <b>Tracking metadata with Aim SDK</b>
""")

ui.code("""
####################################
# Write simple values
####################################

from aim import Container, Sequence

# Create a Container object, writing to default repository 
c = Container()

# Set container attributes
c['foo'] = 'bar'
c['x'] = 0.1
c['y'] = {}
c['z'] = []

# Get or create a Sequence object by name
s = c.sequences['my_sequence']

# Track some values
s.track(1)
s.track(2)

# Track with additional axis
s.track(.3, x=0, y=0)
s.track(.4, x=0, y=1)
""")

ui.html("""
    <b>Querying tracked metadata</b>
""")

ui.code("""
####################################
# Query containers and sequences
####################################
from aim import Repo

# Open repository in read-only mode
r = Repo.from_path('.', read_only=True)

# Query containers and iterate over
for cont in r.containers('container.x >= 1')
    ...

# Get the first matching container
cont = r.containers('container.x >= 1').first()

# Get first 10 containers matching query
cont_list = r.containers('container.x >= 1').limit(10).all()

# Query all sequences matching expression
r.sequences('sequence.name == "loss" and sequence.context.subset == "train"').all()

# Filter sequences by it's container property
for s in r.sequences('sequence.name == "loss" and container.batch_size == 64'):
    ...

""")

ui.html("""
    <b>Specifying metadata type as additional filter</b>
""")

ui.html("""
    Aim Python SDK provides a convenient way to query sequences and containers based on their type. This can be done
    either by specifying the object type as argument or by using filter() classmethod:
""")

ui.code("""
####################################
# Query sequences of type Metric
####################################

# Option 1: Use Repo.sequence method
r.sequences('sequence.name == "loss"', Metric).all()

# Option 2: Use Metric.filter classmethod
from aimstack.base import Metric

Metric.filter('sequence.name == "loss"').all()
""")

ui.html("""
    More examples on how to use Aim SDK type system can be found below:
""")
ui.board_link('sdk/aim_types.py', 'Using Aim SDK Type System')

ui.html("""
    The following sections explore Aim core classes interface in depth:
""")

ui.board_link('sdk/container.py', 'Container API reference')
ui.board_link('sdk/sequence.py', 'Sequence API reference')
ui.board_link('sdk/record.py', 'Object API reference')
