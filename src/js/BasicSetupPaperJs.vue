<template lang="html">
    <div id="basic-setup-paperjs">
        <a href="https://github.com/mul14/vue-paperjs-example/blob/master/src/App.vue">https://github.com/mul14/vue-paperjs-example/blob/master/src/App.vue</a>
        <canvas id="myCanvas" ref="myCanvas" resize></canvas>
    </div>
</template>

<script>
import Paper from 'paper'
export default {
    name: 'BasicSetupPaperJs',
    data: () => ({
        canvas: null
    }),
    mounted() {
        var vue = this
        this.canvas = this.$refs.myCanvas
        Paper.setup(vue.canvas)
        var path = new Paper.Path()
        path.strokeColor = 'red'
        var start = new Paper.Point(100, 100)
        path.moveTo(start)
        path.lineTo(start.add([ 200, -50 ]))

        var circle = new Paper.Shape.Circle({
            center: [80, 50],
            radius: 30,
            strokeColor: 'blue',
        })

        Paper.view.draw()
    }
}
</script>

<style lang="scss">

    canvas {
        width: 100%;
        height: 100%;
    }

</style>
