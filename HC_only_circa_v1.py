#/Library/Frameworks/Python.framework/Versions/2.7/bin/python
### hierarchical_clustering.py
#Copyright 2005-2020
#Author Nathan Salomonis - nsalomonis@gmail.com

#Permission is hereby granted, free of charge, to any person obtaining a copy 
#of this software and associated documentation files (the "Software"), to deal 
#in the Software without restriction, including without limitation the rights 
#to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
#copies of the Software, and to permit persons to whom the Software is furnished 
#to do so, subject to the following conditions:

#THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
#INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
#PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
#HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION 
#OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
#SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#################
### Imports an tab-delimited expression matrix and produces and hierarchically clustered heatmap
#################

import scipy
import scipy.cluster.hierarchy as sch
import scipy.spatial.distance as dist
import numpy
import string
import time
import sys, os
import getopt
import warnings
import fastcluster as fc

################# Perform the hierarchical clustering #################

def heatmap(x, row_header, column_header, row_method,
            column_method, row_metric, column_metric,
            color_gradient, filename, graphics=True):
    
    print "\nPerforming hiearchical clustering using %s for columns and %s for rows" % (column_metric,row_metric)

    #### Compute and plot top dendrogram
    if column_method != None:
        start_time = time.time()
        d2 = dist.pdist(x.T)
        D2 = dist.squareform(d2)
        Y2 = fc.linkage(D2, method=column_method, metric=column_metric) ### array-clustering metric - 'average', 'single', 'centroid', 'complete'
        Z2 = sch.dendrogram(Y2, no_plot=True)
        ind2 = sch.fcluster(Y2,0.7*max(Y2[:,2]),'distance') ### This is the default behavior of dendrogram
        time_diff = str(round(time.time()-start_time,1))
        print 'Column clustering completed in %s seconds' % time_diff
    else:
        ind2 = ['NA']*len(column_header) ### Used for exporting the flat cluster data
        
    ### Compute and plot left dendrogram.
    if row_method != None:
        start_time = time.time()
        d1 = dist.pdist(x)
        D1 = dist.squareform(d1)  # full matrix
        Y1 = fc.linkage(D1, method=row_method, metric=row_metric) ### gene-clustering metric - 'average', 'single', 'centroid', 'complete'
        Z1 = sch.dendrogram(Y1, no_plot=True, orientation='right')
        ind1 = sch.fcluster(Y1,0.7*max(Y1[:,2]),'distance') ### This is the default behavior of dendrogram
        time_diff = str(round(time.time()-start_time,1))
        print 'Row clustering completed in %s seconds' % time_diff
    else:
        ind1 = ['NA']*len(row_header) ### Used for exporting the flat cluster data
 
    ### Plot distance matrix.
    xt = x
    if column_method != None:
        idx2 = Z2['leaves'] ### apply the clustering for the array-dendrograms to the actual matrix data
        xt = xt[:,idx2]
        """ Error can occur here if hopach was selected in a prior run but now running NONE """
        try: ind2 = [ind2[i] for i in idx2] ### replaces the above due to numpy specific windows version issue
        except Exception:
            column_method=None
            xt = x
            ind2 = ['NA']*len(column_header) ### Used for exporting the flat cluster data
            ind1 = ['NA']*len(row_header) ### Used for exporting the flat cluster data
            
    if row_method != None:
        idx1 = Z1['leaves'] ### apply the clustering for the gene-dendrograms to the actual matrix data
        prior_xt = xt
        xt = xt[idx1,:]   # xt is transformed x
        try: ind1 = [ind1[i] for i in idx1] ### replaces the above due to numpy specific windows version issue
        except Exception:
            if 'MarkerGenes' in dataset_name:
                ind1 = ['NA']*len(row_header) ### Used for exporting the flat cluster data
                row_method = None

    new_row_header=[]
    new_column_header=[]
    for i in range(x.shape[0]):
        if row_method != None:
            new_row_header.append(row_header[idx1[i]])
        else:
            new_row_header.append(row_header[i])
    for i in range(x.shape[1]):
        if column_method != None:
            new_column_header.append(column_header[idx2[i]])
        else: ### When not clustering columns
            new_column_header.append(column_header[i])
            
    exportFlatClusterData(filename[:-4]+'-clustered.txt', new_row_header,new_column_header,xt,ind1,ind2)
    
################# Export the flat cluster data #################

def shrink(i):
    r = str(i)
    r = r[0:4]
    return r

def exportFlatClusterData(filename, new_row_header,new_column_header,xt,ind1,ind2):
    """ Export the clustered results as a text file, only indicating the flat-clusters rather than the tree """
    
    filename = string.replace(filename,'.pdf','.txt')
    export_text = open(filename,'w')
    column_header = string.join(['UID']+new_column_header,'\t')+'\n' ### format column-names for export
    export_text.write(column_header)
    column_clusters = string.join(['column_clusters-flat']+ map(str, ind2),'\t')+'\n' ### format column-flat-clusters for export
    export_text.write(column_clusters)
    
    ### The clusters, dendrogram and flat clusters are drawn bottom-up, so we need to reverse the order to match
    new_row_header = new_row_header[::-1]
    xt = xt[::-1]
    
    ### Export each row in the clustered data matrix xt
    i=0
    for row in xt:
        export_text.write(string.join([new_row_header[i]]+map(shrink, row),'\t')+'\n')
        i+=1
    export_text.close()
    
################# General data import methods #################

def importData(filename,normalize=False):
    start_time = time.time()
    matrix=[]
    row_header=[]
    first_row=True

    if '/' in filename:
        dataset_name = string.split(filename,'/')[-1][:-4]
    else:
        dataset_name = string.split(filename,'\\')[-1][:-4]
        
    for line in open(filename,'rU').xreadlines():         
        t = string.split(line[:-1],'\t') ### remove end-of-line character - file is tab-delimited
        if first_row:
            column_header = t[1:]
            first_row=False
        else:
            try:
                s = map(float,t[1:])
            except: ### If missing values
                s=[]
                for v in t[1:]:
                    try: s.append(float(v))
                    except: s.append(0)
            
            if normalize!=False:
                with warnings.catch_warnings():
                    warnings.filterwarnings("ignore",category=UserWarning) ### hides import warnings
                    avg = numpy.median(s)
                s = map(lambda x: x-avg,s) ### normalize to the mean
                matrix.append(s)
                row_header.append(t[0])
                
    time_diff = str(round(time.time()-start_time,1))
    try:
        print '\n%d rows and %d columns imported for %s in %s seconds...' % (len(matrix),len(column_header),dataset_name,time_diff)
    except Exception:
        print 'No data in input file.'; force_error
    return numpy.array(matrix), column_header, row_header
  
if __name__ == '__main__':
    
    ################  Default Methods ################
    row_method = 'ward'
    column_method = 'ward'
    row_metric = 'euclidean'
    column_metric = 'euclidean'
    color_gradient = 'red_white_blue'
    graphics = True
    normalize = True
    
    """ Running with cosine or other distance metrics can often produce negative Z scores
        during clustering, so adjustments to the clustering may be required.
        
    see: http://docs.scipy.org/doc/scipy/reference/cluster.hierarchy.html
    see: http://docs.scipy.org/doc/scipy/reference/spatial.distance.htm  
    """
    ################  Comand-line arguments ################
    if len(sys.argv[1:])<=1:  ### Indicates that there are insufficient number of command-line arguments
        print "Warning! Please designate a tab-delimited input expression file in the command-line"
        print "Example: python hierarchical_clustering.py --i /Users/me/logfolds.txt"
        sys.exit()
    else:
        options, remainder = getopt.getopt(sys.argv[1:],'', ['i=','row_method=','column_method=',
                                                    'row_metric=','column_metric=','color_gradient=',
                                                    'normalize='])
        for opt, arg in options:
            if opt == '--i': filename=arg
            elif opt == '--row_method': row_method=arg
            elif opt == '--column_method': column_method=arg
            elif opt == '--row_metric': row_metric=arg
            elif opt == '--column_metric': column_metric=arg
            elif opt == '--color_gradient': color_gradient=arg
            elif opt == '--normalize':
                normalize = arg
                if normalize == 'no' or normalize == 'false' or normalize == 'False' or normalize == 'FALSE':
                    normalize = False
    
            else:
                print "Warning! Command-line argument: %s not recognized. Exiting..." % opt; sys.exit()
            
    matrix, column_header, row_header = importData(filename,normalize=normalize)

    if len(matrix)>0:
        try:
            heatmap(matrix, row_header, column_header, row_method, column_method, row_metric, column_metric, color_gradient, filename, graphics=graphics)
        except Exception:
            print 'Error using %s ... trying euclidean instead' % row_metric
            row_metric = 'euclidean'
            try:
                heatmap(matrix, row_header, column_header, row_method, column_method, row_metric, column_metric, color_gradient, filename, graphics=graphics)
            except IOError:
                print 'Error with clustering encountered'
