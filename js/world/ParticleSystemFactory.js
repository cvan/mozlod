"use strict"

define([
    'goo/renderer/Util',
    'goo/shapes/ShapeCreator',
    'goo/entities/EntityUtils',
    'goo/renderer/Shader',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/Material',
    'goo/entities/components/ScriptComponent',
    'goo/entities/World',
    'goo/entities/components/MeshDataComponent',
    'goo/entities/components/MeshRendererComponent',

    'goo/renderer/Texture',
    'goo/renderer/shaders/ShaderBuilder',
    'goo/entities/systems/ParticlesSystem',
    'goo/entities/components/ParticleComponent',
    'goo/particles/ParticleUtils'
], function(
    Util,
    ShapeCreator,
    EntityUtils,
    Shader,
    ShaderLib,
    Material,
    ScriptComponent,
    World,
    MeshDataComponent,
    MeshRendererComponent,
    Texture,
    ShaderBuilder,
    ParticlesSystem,
    ParticleComponent,
    ParticleUtils
    ) {

    var particleMaterialCache = {};

    var goo;
    var setGoo = function(gg) {
        goo = g;
    };


    var defineEmissionVelocity = function(emitFunctions) {
        if (!emitFunctions) return;
        if (emitFunctions["velocity"]) return function (particle, particleEntity) {
            particle.velocity = emitFunctions["velocity"](particle);
            return particle.velocity;
        };
    };

    var defineEmissionPoint = function(emitFunctions) {
        if (!emitFunctions) return;
        if (emitFunctions["position"]) return function (particle, particleEntity) {
            particle.position = emitFunctions["position"](particle);
            return ParticleUtils.applyEntityTransformPoint(particle.position, particleEntity);
        };
    };

    var defineEmitters = function(emitterSources, emitFunctions) {
        var emitters = [];
        for (var i = 0; i < emitterSources.length; i++) {
            var emitterParams = emitterSources[i];

            var emitterData = {
                getEmissionPoint : defineEmissionPoint(emitFunctions),
                getEmissionVelocity : defineEmissionVelocity(emitFunctions)
            };
            for (var index in emitterParams) {
                emitterData[index] = emitterParams[index];
            }
            emitters.push(emitterData);
        }
        return emitters;
    };

    var determineParticleCount = function(emitterSources) {
        var count = 0;
        for (var i = 0; i < emitterSources.length; i++) {
            var emitterParams = emitterSources[i];
            count += emitterParams.releaseRatePerSecond * (emitterParams.maxLifetime *0.55 + emitterParams.minLifetime *0.55);
        }
        return Math.ceil(count)
    };

    var defineTimeline = function(timelineSource) {
        var timeline = [];
        for (var i = 0; i < timelineSource.length; i++) {
            var timelineParams = timelineSource[i];

            var timelineData = {};
            for (var index in timelineParams) {
                timelineData[index] = timelineParams[index];
            }
            timeline.push(timelineData)
        }
        return timeline;
    };

    var determineParentEntity = function(sysParams, parent) {
        var parentSpace = null;
        if (sysParams.targetSpace == "parent") parentSpace = parent;
        if (sysParams.targetSpace == "world") parentSpace = parent._world.world_root;
        return parentSpace;
    };

    var createParticleEmitters = function(entity, parentGooEntity, systemParams, emitFunctions) {

            var particleComponent = new ParticleComponent({
                parentEntity:determineParentEntity(systemParams, parentGooEntity),
                timeline: defineTimeline(systemParams.timeline),
                emitters : defineEmitters(systemParams.emitters, emitFunctions),
                particleCount : determineParticleCount(systemParams.emitters)
            });


        entity.setComponent(particleComponent);
        var meshComp = new MeshDataComponent(particleComponent.meshData);
        entity.setComponent(meshComp);

    };

    var buildParticleSystem = function(entity, systemParams, emitFunctions, texture, blendState) {

        entity.transformComponent.transform.translation.set(0, 0, 0);
        if (particleMaterialCache[entity.name]) {
            var material = particleMaterialCache[entity.name];
        } else {
            var material = Material.createMaterial(ShaderLib.particles);
            material.setTexture('DIFFUSE_MAP', texture);
            material.blendState = blendState;
            material.cullState.enabled = false;
            material.depthState.write = false;
            material.depthState.read = true;
            material.renderQueue =3100;
            texture.wrapS = 'EdgeClamp';
            texture.wrapT = 'EdgeClamp';
            texture.generateMipmaps = true;
            particleMaterialCache[entity.name] = material;
        }

        var meshRendererComponent = new MeshRendererComponent();
        meshRendererComponent.cullMode = "Never";
        meshRendererComponent.materials.push(material);
        entity.setComponent(meshRendererComponent);
        return entity;
    };

    return {
        setGoo:setGoo,
        buildParticleSystem:buildParticleSystem,
        createParticleEmitters:createParticleEmitters
    }

});