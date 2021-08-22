from aim.cli.upgrade.utils import convert_2to3

def test_upgrade_cmd():
    convert_2to3('/Users/alberttorosyan/aimhub/logs/small_sample/.aim')
