export const initialCode = `from aim.sequences import Images, Audios, Figures, Texts 
from aim.ui.layout import Grid, Cell
from aim.ui.viz import ImagesList, AudiosList, FiguresList, TextsList

images = Images.query()
audios = Audios.query()
texts = Texts.query()

images_list = ImagesList(images)

audios_list = AudiosList(audios)

text_list = TextsList(texts, color=["record.step"])

runs_table = Cell(
                [images_list, audios_list, text_list], 
                facet={
                    "row": ["run.name"], 
                    "column": ["sequence.type","sequence.name"]
                },
                stack=["record.step"])

Grid([
    [runs_table]
])
`;
