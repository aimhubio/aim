#!/bin/bash

lessc scripts/export-theme.less dist/aim-theme.css
lessc dist/aim-theme.css --clean-css="--s1 --advanced --compatibility=ie8" > dist/aim-theme.min.css