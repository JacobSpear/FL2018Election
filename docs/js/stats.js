function arrSum(myArray){
    let sum = 0;
    for(i=0;i<myArray.length;i++){
        sum+=myArray[i]
    }
    return sum;
}

function arrMean(myArray){
    return arrSum(myArray)/myArray.length;
}

function arrDot(array1,array2){
    if(array1.length===array2.length){
        let sum = 0;
        for(i=0;i<array1.length;i++){
            sum+= (array1[i]*array2[i])
        }
        return sum;
    } else {
        console.log('ERROR: ARRAYS PASSED TO DOT PRODUCT OF DIFFERENT LENGTHS')
        return 0;
    }
}

function arrStd(array1){
    let array1_adj = array1.map(x => x-arrMean(array1));
    return Math.hypot(...array1_adj)/Math.sqrt(array1.length);
}


function pearsonR(array1,array2){
    let array1_adj = array1.map(x => x-arrMean(array1));
    let array2_adj = array2.map(x => x-arrMean(array2));
    let ans = Math.round(100*arrDot(array1_adj,array2_adj)/(Math.hypot(...array1_adj)*Math.hypot(...array2_adj)))/100;
    return ans;
}