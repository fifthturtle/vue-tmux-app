<template>
    <kendo-treeview :data-source="treeDataSource"
                    :data-text-field="['name', 'name']">
    </kendo-treeview>
</template>

<script>
import { mapGetters } from "vuex";
export default {
    name: 'server-tree',
    data() {
        return {
            treeDataSource: new kendo.data.HierarchicalDataSource({
                data: this.serverTree,
                schema: {
                    model: {
                        children: 'sessions'
                    }
                }
            })
        }
    },
  computed: {
    ...mapGetters(["serverTree"])
  }
}
</script>

<style scoped>

</style>