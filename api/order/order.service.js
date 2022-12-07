const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('order')
        var orders = await collection.find(criteria).toArray()

        // const orders = await collection.find(criteria).toArray()
        // var orders = await collection.aggregate([
        //     {
        //         $match: criteria
        //     },

        //     {
        //         $lookup:
        //         {
        //             localField: 'seller._id',
        //             from: 'user',
        //             foreignField: '_id',
        //             as: 'seller'
        //         }
        //     },
        //     {
        //         $unwind: '$seller'
        //     },
        //     {
        //         $lookup:
        //         {

        //             localField: 'buyer._id',
        //             from: 'user',
        //             foreignField: '_id',
        //             as: 'buyer'
        //         }
        //     },
        //     {
        //         $unwind: '$buyer'
        //     },
        //     {
        //         $lookup:
        //         {

        //             localField: 'gig._id',
        //             from: 'gig',
        //             foreignField: '_id',
        //             as: 'gig'
        //         }
        //     },
        //     {
        //         $unwind: '$gig'
        //     }
        // ]).toArray()
        // orders = orders.map(order => {
        //     order.seller = { _id: order.seller._id, fullname: order.seller.fullname }
        //     order.buyer = { _id: order.buyer._id, fullname: order.buyer.fullname }
        //     order.gig = { _id: order.gig._id, title: order.gig.title, price: order.gig.price }
        //     delete order.seller
        //     delete order.buyer
        //     delete order.gig
        //     return order
        // })

        return orders
    } catch (err) {
        logger.error('cannot find orders', err)
        throw err
    }

}

async function remove(orderId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { loggedinUser } = store
        const collection = await dbService.getCollection('order')
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(orderId) }
        if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId(loggedinUser._id)
        const { deletedCount } = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove order ${orderId}`, err)
        throw err
    }
}


async function add(order) {
    try {
        const orderToAdd = {
            byUserId: ObjectId(order.byUserId),
            aboutUserId: ObjectId(order.aboutUserId),
            txt: order.txt
        }
        const collection = await dbService.getCollection('order')
        await collection.insertOne(orderToAdd)
        return orderToAdd
    } catch (err) {
        logger.error('cannot insert order', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.byUserId) criteria.byUserId = filterBy.byUserId
    return criteria
}

module.exports = {
    query,
    remove,
    add
}


