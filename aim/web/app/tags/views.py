from flask import (
    abort,
    jsonify,
    request,
    Blueprint,
    make_response,
    send_from_directory,
)
from flask_restful import Api, Resource
from sqlalchemy.orm import joinedload

from aim.web.app.db import db
from aim.web.app.commits.models import Tag


tags_bp = Blueprint('tags', __name__)
tags_api = Api(tags_bp)


@tags_api.resource('/list')
class TagListApi(Resource):
    def get(self):
        tags = Tag.query.filter(Tag.is_hidden.isnot(True)) \
            .order_by(Tag.created_at.desc()).all()

        result = []
        for t in tags:
            result.append({
                'id': t.uuid,
                'name': t.name,
                'color': t.color,
                'num_commits': len(t.commits),
            })

        return jsonify(result)


@tags_api.resource('/new')
class TagCreateApi(Resource):
    def post(self):
        command_form = request.form

        name = command_form.get('name') or ''
        name = name.strip()

        color = command_form.get('color') or ''
        color = color.strip()

        if not name or not color:
            return make_response(jsonify({}), 403)

        t = Tag(name, color)
        db.session.add(t)
        db.session.commit()

        return jsonify({
            'id': t.uuid,
        })


@tags_api.resource('/update')
class TagUpdateApi(Resource):
    def post(self):
        command_form = request.form

        uuid = command_form.get('id') or ''
        uuid = uuid.strip()

        tag = Tag.query.filter_by(uuid=uuid).first()
        if not tag:
            return make_response(jsonify({}), 404)
        
        if 'name' in command_form:
            tag.name = command_form.get('name').strip()
            if not tag.name:
                return make_response(jsonify({}), 403)
        if 'color' in command_form:
            tag.color = command_form.get('color').strip()
            if not tag.color:
                return make_response(jsonify({}), 403)
        if 'is_hidden' in command_form:
            tag.is_hidden = command_form.get('is_hidden') == 'true'

        db.session.commit()

        return jsonify({
            'id': tag.uuid,
        })


@tags_api.resource('/runs/<tag_id>')
class TagGetRelatedRuns(Resource):
    def get(self, tag_id):
        tag = Tag.query.options(joinedload('commits')) \
            .filter_by(uuid=tag_id) \
            .first()
        
        related_runs = []
        if tag:
            for commit in tag.commits:
                related_runs.append({
                    'hash': commit.hash,
                    'experiment_name': commit.experiment_name,
                    'uuid': commit.uuid,
                    'created_at': commit.created_at,
                })

        return jsonify({
            'data': related_runs,
        })


@tags_api.resource('/<tag_id>')
class TagGetSingle(Resource):
    def get(self, tag_id):
        tag = Tag.query.filter_by(uuid=tag_id).first()

        if not tag:
            return make_response(jsonify({}), 404)

        return jsonify({
            'name': tag.name,
            'color': tag.color,
            'is_hidden': tag.is_hidden,
        })
